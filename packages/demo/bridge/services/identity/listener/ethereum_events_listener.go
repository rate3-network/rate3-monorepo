package listener

import (
	"sync"
)

func (e *EthereumEventsListener) StartListenStellarIdentityAccounts(events chan StellarIdentityAccountsEvents) {
	e.Logger.Debug("Starting stream of StellarIdentityAccounts ethereum events")

	listener := &stellaridentityaccountsListener{
		Logger:    e.Logger,
		DB:        e.DB,
		Contracts: e.Contracts,
		Client:    e.Client,
		Events:    events,
		Mutex:     &sync.Mutex{},
	}

	listener.Start()
}
