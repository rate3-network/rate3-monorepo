package listener

import (
	"context"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/contract/stellaridentityaccounts"
	"go.uber.org/zap"
)

func (l *stellaridentityaccountsListener) Start() {
	for {
		l.Mutex.Lock()
		go l.getEvents()
	}
}

func (l *stellaridentityaccountsListener) getEvents() {
	header, err := l.Client.HeaderByNumber(context.Background(), nil)
	if err != nil {
		l.Logger.Error("Failed to get latest block, retry after timeout",
			zap.Error(err),
			zap.Int64("timeout", 5),
		)
		waitFor(5, l.Mutex)
		return
	}

	latestContract, err := l.DB.LoadContract(l.Contracts.StellarIdentityAccounts.DB.Address)
	if err != nil {
		l.Logger.Error("Failed to get latest contract details from db, retry after timeout",
			zap.Error(err),
			zap.Int64("timeout", 5),
		)
		waitFor(5, l.Mutex)
		return
	}
	l.Contracts.StellarIdentityAccounts.DB = *latestContract

	endBlock := header.Number.Uint64()

	if latestContract.BlockNumber == endBlock {
		l.Logger.Info("No new blocks, retry after timeout",
			zap.Int64("timeout", 15),
		)
		waitFor(15, l.Mutex)
		return
	}

	filterOpts := bind.FilterOpts{
		Start: latestContract.BlockNumber,
		End:   &endBlock,
	}

	events := StellarIdentityAccountsEvents{
		contractID: latestContract.ID,
		events:     make([]stellaridentityaccounts.AccountEvent, 0),
		startBlock: latestContract.BlockNumber,
		endBlock:   endBlock,
	}

	err = l.getAccountRequested(&filterOpts, &events)
	if err != nil {
		l.Logger.Error("Failed to get AccountRequested events",
			zap.Error(err),
			zap.Uint64("StartBlock", filterOpts.Start),
			zap.Any("EndBlock", filterOpts.End),
		)
		return
	}
	err = l.getAccountAdded(&filterOpts, &events)
	if err != nil {
		l.Logger.Error("Failed to get AccountAdded events",
			zap.Error(err),
			zap.Uint64("StartBlock", filterOpts.Start),
			zap.Any("EndBlock", filterOpts.End),
		)
		return
	}
	err = l.getAccountRemoved(&filterOpts, &events)
	if err != nil {
		l.Logger.Error("Failed to get AccountRemoved events",
			zap.Error(err),
			zap.Uint64("StartBlock", filterOpts.Start),
			zap.Any("EndBlock", filterOpts.End),
		)
		return
	}

	l.Events <- events
	waitFor(15, l.Mutex)
}

func (l *stellaridentityaccountsListener) getAccountRequested(filterOpts *bind.FilterOpts, allEvents *StellarIdentityAccountsEvents) error {
	events, err := l.Contracts.StellarIdentityAccounts.Instance.FilterAccountRequested(filterOpts)
	if err != nil {
		l.Logger.Error("Failed to get events", zap.Error(err))
		return err
	}

	for events.Next() {
		ev := events.Event
		l.Logger.Debug("New stellar identity accounts AccountRequested event", zap.Any("event", ev))
		accountEvent, err := l.makeStellarIdentityAccountsEvent(ev.Identity, ev.Account, ev.Raw)
		if err != nil {
			l.Logger.Error("Failed to get block by number",
				zap.Error(err),
				zap.Any("event", accountEvent),
			)
			continue
		}
		accountEvent.Name = "AccountRequested"
		allEvents.events = append(allEvents.events, *accountEvent)
	}

	return nil
}

func (l *stellaridentityaccountsListener) getAccountAdded(filterOpts *bind.FilterOpts, allEvents *StellarIdentityAccountsEvents) error {
	events, err := l.Contracts.StellarIdentityAccounts.Instance.FilterAccountAdded(filterOpts)
	if err != nil {
		l.Logger.Error("Failed to get events", zap.Error(err))
		return err
	}

	for events.Next() {
		ev := events.Event
		l.Logger.Debug("New stellar identity accounts AccountAdded event", zap.Any("event", ev))
		accountEvent, err := l.makeStellarIdentityAccountsEvent(ev.Identity, ev.Account, ev.Raw)
		if err != nil {
			l.Logger.Error("Failed to get block by number",
				zap.Error(err),
				zap.Any("event", accountEvent),
			)
			continue
		}
		accountEvent.Name = "AccountAdded"
		allEvents.events = append(allEvents.events, *accountEvent)
	}

	return nil
}

func (l *stellaridentityaccountsListener) getAccountRemoved(filterOpts *bind.FilterOpts, allEvents *StellarIdentityAccountsEvents) error {
	events, err := l.Contracts.StellarIdentityAccounts.Instance.FilterAccountRemoved(filterOpts)
	if err != nil {
		l.Logger.Error("Failed to get events", zap.Error(err))
		return err
	}

	for events.Next() {
		ev := events.Event
		l.Logger.Debug("New stellar identity accounts AccountRemoved event", zap.Any("event", ev))
		accountEvent, err := l.makeStellarIdentityAccountsEvent(ev.Identity, ev.Account, ev.Raw)
		if err != nil {
			l.Logger.Error("Failed to get block by number",
				zap.Error(err),
				zap.Any("event", accountEvent),
			)
			continue
		}
		accountEvent.Name = "AccountRemoved"
		allEvents.events = append(allEvents.events, *accountEvent)
	}

	return nil
}

func (l *stellaridentityaccountsListener) makeStellarIdentityAccountsEvent(identity common.Address, account [32]byte, log types.Log) (*stellaridentityaccounts.AccountEvent, error) {
	header, err := l.Client.HeaderByNumber(context.Background(), big.NewInt(int64(log.BlockNumber)))
	if err != nil {
		return nil, err
	}

	return &stellaridentityaccounts.AccountEvent{
		Identity:    identity,
		Account:     account,
		Raw:         log,
		BlockHeader: header,
	}, nil
}
