package main

import (
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/config"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/config/key"
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
		return lvl < zapcore.ErrorLevel && lvl > zapcore.DebugLevel
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

func main() {
	logger := initLogger()
	defer logger.Sync()

	_config, err := config.Init()
	if err != nil {
		logger.Fatal("Unable to initialize configuration", zap.Error(err))
	}

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt, os.Kill, syscall.SIGTERM)

	dbClient, err := db.NewPostgresDB(_config.Database, logger.Named("DB"))
	if err != nil {
		logger.Fatal("Unable to initialize db client", zap.Error(err))
	}

	stellarKeypair, err := key.StellarKeypairFromSecret(_config.Keys.Stellar.DecryptedSecret)
	if err != nil {
		logger.Fatal("Unable to decode stellar keypair", zap.Error(err))
	}

	stellarAccount, err := dbClient.LoadStellarAccount(stellarKeypair.Address())
	if err != nil {
		logger.Fatal("Unable to load stellar account", zap.Error(err))
	}

	fatalities := make(chan error)
	ethereumLinkRequests := make(chan db.LinkRequest)
	stellarIncomingPayments := make(chan horizon.Payment)

	horizonClient := &horizon.Client{
		URL:  _config.Networks.Stellar.URL,
		HTTP: http.DefaultClient,
	}

	stellarPaymentsListener := &listener.StellarPayments{
		Logger:     logger.Named("StellarPaymentsListener"),
		Fatalities: fatalities,
		Client:     horizonClient,
	}

	go stellarPaymentsListener.Start(stellarAccount.Address, stellarAccount.Cursor, stellarIncomingPayments)

	stellarPaymentHandler := &eventhandler.StellarPaymentHandler{
		Logger:        logger.Named("StellarPaymentsHandler"),
		DB:            dbClient,
		Fatalities:    fatalities,
		HorizonClient: horizonClient,
		LinkRequests:  ethereumLinkRequests,
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
		case killSignal := <-interrupt:
			logger.Debug("Got signal", zap.Any("signal", killSignal))
			logger.Debug("Killing service")
			return
		}
	}
}
