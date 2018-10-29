package listener

import (
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/contract/stellaridentityaccounts"
)

func (e StellarIdentityAccountsEvents) ContractID() int64 {
	return e.contractID
}

func (e StellarIdentityAccountsEvents) StellarIdentityAccountsEvents() stellaridentityaccounts.AccountEventSlice {
	return e.events
}

func (e StellarIdentityAccountsEvents) StartBlock() uint64 {
	return e.startBlock
}

func (e StellarIdentityAccountsEvents) EndBlock() uint64 {
	return e.endBlock
}
