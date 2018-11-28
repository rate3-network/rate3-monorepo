package listener

import (
	"sync"
	"time"

	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/contract"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/db"
	"go.uber.org/zap"
)

type stellaridentityaccountsListener struct {
	Logger    *zap.Logger
	DB        db.Database
	Contracts *contract.Contracts
	Client    *ethclient.Client
	Events    chan StellarIdentityAccountsEvents
	Mutex     *sync.Mutex
}

func waitFor(seconds int64, mutex *sync.Mutex) {
	go func(seconds int64, mutex *sync.Mutex) {
		time.Sleep(time.Duration(seconds) * time.Second)
		mutex.Unlock()
	}(seconds, mutex)
}
