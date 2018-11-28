package eventhandler

import (
	"crypto/ecdsa"
	"sync"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/contract"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/db"
	"github.com/stellar/go/clients/horizon"
	"go.uber.org/zap"
)

type StellarPaymentHandler struct {
	Logger        *zap.Logger
	Fatalities    chan error
	DB            db.Database
	HorizonClient *horizon.Client
}

type LinkRequestHandler struct {
	Logger         *zap.Logger
	Fatalities     chan error
	DB             db.Database
	Contracts      *contract.Contracts
	EthereumClient *ethclient.Client
	PrivateKey     *ecdsa.PrivateKey
	FromAddress    common.Address
	Mutex          *sync.Mutex
}

type StellaridentityaccountsEventsHandler struct {
	Logger     *zap.Logger
	Fatalities chan error
	DB         db.Database
}
