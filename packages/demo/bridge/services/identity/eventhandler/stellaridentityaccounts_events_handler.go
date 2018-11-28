package eventhandler

import (
	"encoding/hex"
	"sort"
	"strings"
	"time"

	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/db"
	"github.com/stellar/go/strkey"
	"go.uber.org/zap"
)

func (h *StellaridentityaccountsEventsHandler) Receive(events stellarIdentityAccountsEvents) {
	allEvents := events.StellarIdentityAccountsEvents()
	dbEvents := make([]db.StellarIdentityAccountsEvent, 0)

	// Sort by block number
	sort.Slice(allEvents, func(i, j int) bool {
		if allEvents[i].Raw.BlockNumber < allEvents[j].Raw.BlockNumber {
			return true
		} else if allEvents[i].Raw.BlockNumber > allEvents[j].Raw.BlockNumber {
			return false
		}

		return strings.Compare(allEvents[i].Name, allEvents[j].Name) < 0
	})

	for _, ev := range allEvents {
		identityAddress := hex.EncodeToString(ev.Identity.Bytes())
		accountAddress, err := strkey.Encode(strkey.VersionByteAccountID, ev.Account[:])
		if err != nil {
			h.Logger.Error("Failed to parse stellar account address", zap.Error(err))
			continue
		}

		dbEvents = append(dbEvents, db.StellarIdentityAccountsEvent{
			ContractID:      events.ContractID(),
			EventName:       ev.Name,
			IdentityAddress: identityAddress,
			AccountAddress:  accountAddress,
			TxHash:          hex.EncodeToString(ev.Raw.TxHash.Bytes()),
			BlockNumber:     ev.Raw.BlockNumber,
			TxIndex:         ev.Raw.TxIndex,
			BlockTimestamp:  time.Unix(ev.BlockHeader.Time.Int64(), 0),
		})
	}

	err := h.DB.AddStellarIdentityAccountsEventsUntilBlockNumber(
		events.ContractID(), events.EndBlock(), dbEvents)

	if err != nil {
		h.Logger.Error("Failed to save stellar identity accounts events", zap.Error(err))
		return
	}
}
