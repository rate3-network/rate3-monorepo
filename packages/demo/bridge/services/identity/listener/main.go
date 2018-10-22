package listener

import (
	"go.uber.org/zap"

	"github.com/stellar/go/clients/horizon"
)

type StellarPayments struct {
	Logger     *zap.Logger
	Fatalities chan error
	Client     *horizon.Client
}
