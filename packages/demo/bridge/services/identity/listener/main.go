package listener

import (
	"sync"

	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/contract/stellaridentityaccounts"

	"go.uber.org/zap"

	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/contract"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/db"
	"github.com/stellar/go/clients/horizon"
)

type StellarPayments struct {
	Logger     *zap.Logger
	Fatalities chan error
	Client     *horizon.Client
}

type PendingLinkRequests struct {
	Logger       *zap.Logger
	Fatalities   chan error
	DB           db.Database
	LinkRequests chan db.LinkRequest
	Mutex        *sync.Mutex
}

type EthereumEventsListener struct {
	Logger     *zap.Logger
	Fatalities chan error
	DB         db.Database
	Client     *ethclient.Client
	Contracts  *contract.Contracts
}

type StellarIdentityAccountsEvents struct {
	contractID   int64
	blockHeaders map[uint64]*types.Header
	events       stellaridentityaccounts.AccountEventSlice
	startBlock   uint64
	endBlock     uint64
}
