package main

import (
	"crypto/ecdsa"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/config"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/config/key"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/contract"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/db"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/eventhandler"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/listener"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/zapencoder"
	"github.com/stellar/go/clients/horizon"
)

func initLogger() *zap.Logger {
	// First, define our level-handling logic.
	highPriority := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
		return lvl >= zapcore.ErrorLevel
	})
	lowPriority := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
		return lvl < zapcore.ErrorLevel // && lvl > zapcore.DebugLevel
	})

	// High-priority output should go to standard error,
	// and low-priority output should go to standard out.
	consoleDebugging := zapcore.Lock(os.Stdout)
	consoleErrors := zapcore.Lock(os.Stderr)

	consoleEncoderConfig := zap.NewDevelopmentEncoderConfig()
	consoleEncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	consoleEncoder := zapencoder.NewPrettyConsoleEncoder(consoleEncoderConfig)

	// Join the outputs, encoders, and level-handling functions into
	// zapcore.Cores, then tee the cores together.
	core := zapcore.NewTee(
		zapcore.NewCore(consoleEncoder, consoleErrors, highPriority),
		zapcore.NewCore(consoleEncoder, consoleDebugging, lowPriority),
	)

	// From a zapcore.Core, construct a Logger.
	logger := zap.New(core).WithOptions(
		zap.AddCaller(),
	)
	return logger.Named("Bridge")
}

func initConfig(logger *zap.Logger) *config.Config {
	_config, err := config.Init()
	if err != nil {
		logger.Fatal("Unable to initialize configuration", zap.Error(err))
	}
	return _config
}

func initDB(logger *zap.Logger, cfg *config.Config) db.Database {
	dbClient, err := db.NewPostgresDB(cfg.Database, logger.Named("DB"))
	if err != nil {
		logger.Fatal("Unable to initialize db client", zap.Error(err))
	}
	return dbClient
}

func initEthereumClient(logger *zap.Logger, cfg *config.Config) *ethclient.Client {
	ethereumClient, err := ethclient.Dial(cfg.Networks.Ethereum.URL)
	if err != nil {
		logger.Fatal("Unable to connect to ethereum provider",
			zap.Error(err),
			zap.String("Provider URL", cfg.Networks.Ethereum.URL),
		)
	}

	return ethereumClient
}

func initHorizonClient(logger *zap.Logger, cfg *config.Config) *horizon.Client {
	return &horizon.Client{
		URL:  cfg.Networks.Stellar.URL,
		HTTP: http.DefaultClient,
	}
}

func initContracts(logger *zap.Logger, cfg *config.Config, ethereumClient *ethclient.Client) *contract.Contracts {
	contracts, err := contract.NewContracts(
		logger,
		ethereumClient,
		cfg.Networks.Ethereum.IdentityRegistryAddr,
		cfg.Networks.Ethereum.StellarIdentityAccountsAddr,
	)
	if err != nil {
		logger.Fatal("Failed to initialize contracts", zap.Error(err))
	}
	return contracts
}

func initPrivateKey(logger *zap.Logger, cfg *config.Config) *ecdsa.PrivateKey {
	privateKey, err := crypto.HexToECDSA(string(cfg.Keys.Ethereum.DecryptedPrivateKey))
	if err != nil {
		logger.Fatal("Unable to convert private key to ECDSA",
			zap.Error(err),
		)
	}

	return privateKey
}

func loadStellarAccount(logger *zap.Logger, cfg *config.Config, dbClient db.Database) *db.StellarAccount {
	stellarKeypair, err := key.StellarKeypairFromSecret(cfg.Keys.Stellar.DecryptedSecret)
	if err != nil {
		logger.Fatal("Unable to decode stellar keypair", zap.Error(err))
	}

	stellarAccount, err := dbClient.LoadStellarAccount(stellarKeypair.Address())
	if err != nil {
		logger.Fatal("Unable to load stellar account", zap.Error(err))
	}

	return stellarAccount
}

func validateContractOwner(logger *zap.Logger, cfg *config.Config, privateKey *ecdsa.PrivateKey, contracts *contract.Contracts) common.Address {
	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		logger.Fatal("Unable to get public address from private key")
	}

	ethereumAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	logger.Info("Checking owner of stellar identity contract",
		zap.String("Address", contracts.StellarIdentityAccountsAddress.String()),
	)

	ownerAddress, err := contracts.StellarIdentityAccounts.Owner(nil)
	if err != nil {
		logger.Fatal("Unable to call smart contract",
			zap.Error(err),
		)
	} else if ownerAddress != ethereumAddress {
		logger.Fatal("Configured account is not owner of stellar identity contract",
			zap.String("Stellar identity contract owner", ownerAddress.String()),
			zap.String("Configured account", ethereumAddress.String()),
		)
	}

	return ownerAddress
}

func main() {
	logger := initLogger()
	defer logger.Sync()

	cfg := initConfig(logger)
	dbClient := initDB(logger, cfg)
	stellarAccount := loadStellarAccount(logger, cfg, dbClient)

	fatalities := make(chan error)
	ethereumLinkRequests := make(chan db.LinkRequest)
	stellarIncomingPayments := make(chan horizon.Payment)
	interrupt := make(chan os.Signal, 1)
	ethereumTransactionMutex := &sync.Mutex{}

	signal.Notify(interrupt, os.Interrupt, os.Kill, syscall.SIGTERM)

	ethereumClient := initEthereumClient(logger, cfg)
	horizonClient := initHorizonClient(logger, cfg)

	privateKey := initPrivateKey(logger, cfg)
	contracts := initContracts(logger, cfg, ethereumClient)
	ownerAddress := validateContractOwner(logger, cfg, privateKey, contracts)

	stellarPaymentsListener := &listener.StellarPayments{
		Logger:     logger.Named("StellarPaymentsListener"),
		Fatalities: fatalities,
		Client:     horizonClient,
	}

	go stellarPaymentsListener.Start(stellarAccount.Address, stellarAccount.Cursor, stellarIncomingPayments)

	pendingLinkRequestListener := &listener.PendingLinkRequests{
		Logger:       logger.Named("PendingLinkRequests"),
		Fatalities:   fatalities,
		DB:           dbClient,
		LinkRequests: ethereumLinkRequests,
		Mutex:        ethereumTransactionMutex,
	}

	go pendingLinkRequestListener.Start(hex.EncodeToString(ownerAddress.Bytes()))

	stellarPaymentHandler := &eventhandler.StellarPaymentHandler{
		Logger:        logger.Named("StellarPaymentsHandler"),
		DB:            dbClient,
		Fatalities:    fatalities,
		HorizonClient: horizonClient,
	}

	linkRequestHandler := &eventhandler.LinkRequestHandler{
		Logger:         logger.Named("LinkRequestHandler"),
		DB:             dbClient,
		Fatalities:     fatalities,
		Contracts:      contracts,
		EthereumClient: ethereumClient,
		PrivateKey:     privateKey,
		FromAddress:    ownerAddress,
		Mutex:          ethereumTransactionMutex,
	}

	for {
		select {
		case err := <-fatalities:
			logger.Error("Got error", zap.Error(err))
			return
		case payment := <-stellarIncomingPayments:
			logger.Info("Payment received", zap.Any("Payment", payment))
			go stellarPaymentHandler.Receive(stellarAccount, &payment)
		case linkRequest := <-ethereumLinkRequests:
			logger.Info("Link request received", zap.Any("Request", linkRequest))
			linkRequestHandler.Process(linkRequest)
		case killSignal := <-interrupt:
			logger.Debug("Got signal", zap.Any("signal", killSignal))
			logger.Debug("Killing service")
			return
		}
	}
}

func publicAddress(privateKeyBytes []byte) (*common.Address, error) {
	privateKey, err := crypto.HexToECDSA(string(privateKeyBytes))
	if err != nil {
		return nil, err
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("Error casting public key to ECDSA")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	return &fromAddress, nil
}
