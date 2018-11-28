package listener

import (
	"context"

	"github.com/stellar/go/clients/horizon"
	"go.uber.org/zap"
	"gopkg.in/guregu/null.v3"
)

func (s *StellarPayments) Start(address string, cursor null.String, payments chan horizon.Payment) {
	s.Logger.Debug("Starting stream of payment logs")

	horizonAccount, err := s.Client.LoadAccount(address)
	if err != nil {
		s.Logger.Error("Failed to load destination account from horizon", zap.Error(err))
		s.Fatalities <- err
		return
	}

	var horizonCursor *horizon.Cursor
	if cursor.Valid {
		hCursor := horizon.Cursor(cursor.String)
		horizonCursor = &hCursor
	}

	s.Logger.Info("Starting stream",
		zap.String("Account", address),
		zap.Any("Horizon cursor", cursor),
	)
	go func(client *horizon.Client, accountID string, cursor *horizon.Cursor, payments chan horizon.Payment) {
		client.StreamPayments(context.Background(), horizonAccount.AccountID, cursor, func(payment horizon.Payment) {
			payments <- payment
		})
	}(s.Client, horizonAccount.AccountID, horizonCursor, payments)
}
