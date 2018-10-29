package contract

import (
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/contract/identityregistry"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/contract/stellaridentityaccounts"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/db"
	"go.uber.org/zap"
)

type Contracts struct {
	IdentityRegistry struct {
		Instance *identityregistry.Identityregistry
		Address  common.Address
		DB       db.Contract
	}

	StellarIdentityAccounts struct {
		Instance *stellaridentityaccounts.Stellaridentityaccounts
		Address  common.Address
		DB       db.Contract
	}
}

func NewContracts(
	logger *zap.Logger,
	ethereumClient *ethclient.Client,
	identityRegistryAddrStr string,
	stellarIdentityAccountsAddrStr string,
) (*Contracts, error) {

	identityRegistryAddr := common.HexToAddress(identityRegistryAddrStr)
	identityRegistryInstance, err := identityregistry.NewIdentityregistry(identityRegistryAddr, ethereumClient)
	if err != nil {
		logger.Error("Unable to instantiate stellar identity contract",
			zap.Error(err),
			zap.String("Address", identityRegistryAddr.Hex()),
		)
		return nil, ErrInitializeContracts
	}

	stellarIdentityAccountsAddr := common.HexToAddress(stellarIdentityAccountsAddrStr)
	stellarIdentityAccountsInstance, err := stellaridentityaccounts.NewStellaridentityaccounts(stellarIdentityAccountsAddr, ethereumClient)
	if err != nil {
		logger.Fatal("Unable to instantiate stellar identity contract",
			zap.Error(err),
			zap.String("Address", stellarIdentityAccountsAddr.Hex()),
		)
		return nil, ErrInitializeContracts
	}

	contract := Contracts{}
	contract.IdentityRegistry.Instance = identityRegistryInstance
	contract.IdentityRegistry.Address = identityRegistryAddr
	contract.StellarIdentityAccounts.Instance = stellarIdentityAccountsInstance
	contract.StellarIdentityAccounts.Address = stellarIdentityAccountsAddr

	return &contract, nil
}
