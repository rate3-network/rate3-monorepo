package eventhandler

import (
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/contract/stellaridentityaccounts"
)

type stellarIdentityAccountsEvents interface {
	ContractID() int64
	StellarIdentityAccountsEvents() stellaridentityaccounts.AccountEventSlice
	StartBlock() uint64
	EndBlock() uint64
}
