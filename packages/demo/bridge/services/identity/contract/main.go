package contract

import (
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/contract/identityregistry"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/contract/stellaridentityaccounts"
	"go.uber.org/zap"
)

type Contracts struct {
	IdentityRegistry        *identityregistry.Identityregistry
	IdentityRegistryAddress common.Address

	StellarIdentityAccounts        *stellaridentityaccounts.Stellaridentityaccounts
	StellarIdentityAccountsAddress common.Address
}

func NewContracts(
	logger *zap.Logger,
	ethereumClient *ethclient.Client,
	identityRegistryAddrStr string,
	stellarIdentityAccountsAddrStr string,
) (*Contracts, error) {

	identityRegistryAddr := common.HexToAddress(identityRegistryAddrStr)
	identityRegistryContract, err := identityregistry.NewIdentityregistry(identityRegistryAddr, ethereumClient)
	if err != nil {
		logger.Error("Unable to instantiate stellar identity contract",
			zap.Error(err),
			zap.String("Address", identityRegistryAddr.Hex()),
		)
		return nil, ErrInitializeContracts
	}

	stellarIdentityAccountsAddr := common.HexToAddress(stellarIdentityAccountsAddrStr)
	stellarIdentityAccountsContract, err := stellaridentityaccounts.NewStellaridentityaccounts(stellarIdentityAccountsAddr, ethereumClient)
	if err != nil {
		logger.Fatal("Unable to instantiate stellar identity contract",
			zap.Error(err),
			zap.String("Address", stellarIdentityAccountsAddr.Hex()),
		)
		return nil, ErrInitializeContracts
	}

	return &Contracts{
		IdentityRegistry:               identityRegistryContract,
		IdentityRegistryAddress:        identityRegistryAddr,
		StellarIdentityAccounts:        stellarIdentityAccountsContract,
		StellarIdentityAccountsAddress: stellarIdentityAccountsAddr,
	}, nil
}
