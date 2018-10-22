package eventhandler

import (
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/db"
	"github.com/stellar/go/clients/horizon"
	"go.uber.org/zap"
)

type StellarPaymentHandler struct {
	Logger        *zap.Logger
	Fatalities    chan error
	DB            db.Database
	HorizonClient *horizon.Client
	LinkRequests  chan db.LinkRequest
}
