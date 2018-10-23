package listener

import (
	"sync"

	"go.uber.org/zap"

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
