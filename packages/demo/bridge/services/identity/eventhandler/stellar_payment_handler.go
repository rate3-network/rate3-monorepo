package eventhandler

import (
	"strconv"

	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/db"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/stellar"
	"github.com/stellar/go/clients/horizon"
	"go.uber.org/zap"
	"gopkg.in/guregu/null.v3"
)

func (h *StellarPaymentHandler) Receive(account *db.StellarAccount, payment *horizon.Payment) {
	switch payment.Type {
	case "create_account":
		h.handleAccountCreation(account, payment)
	case "payment":
		h.handleIncomingPayment(account, payment)
	}
}

func (h *StellarPaymentHandler) handleAccountCreation(account *db.StellarAccount, payment *horizon.Payment) {
	if account.Cursor.Valid {
		return
	}

	rowsAffected, err := h.DB.SetStellarAccountCursor(account.ID, payment.PagingToken)
	if err != nil || rowsAffected == 0 {
		h.Logger.Error("Unable to set account cursor",
			zap.Error(err),
			zap.Int64("Account ID", account.ID),
			zap.String("Account address", account.Address),
			zap.String("Cursor", payment.PagingToken),
		)
	}
}

func (h *StellarPaymentHandler) handleIncomingPayment(account *db.StellarAccount, payment *horizon.Payment) {
	ethAddress, memo, memoType := h.parseMemo(payment)

	receivedPayment := db.ReceivedPayment{
		ToAccountID: account.ID,
		FromAccount: payment.From,
		TxHash:      payment.TransactionHash,
		PagingToken: payment.PagingToken,
		MemoType:    memoType,
		Memo:        memo,
	}
	if id, err := strconv.Atoi(payment.ID); err == nil {
		receivedPayment.PaymentID = int64(id)
	}

	switch payment.Type {
	case "create_account":
		receivedPayment.FromAccount = payment.Funder
	}

	if !memo.Valid {
		receivedPayment.Status = db.ReceivedPaymentStatusMissingMemo
	} else if memoType != stellar.MemoTypeHash {
		receivedPayment.Status = db.ReceivedPaymentStatusInvalidMemoType
	} else if ethAddress == nil {
		receivedPayment.Status = db.ReceivedPaymentStatusInvalidMemoFormat
	} else {
		receivedPayment.Status = db.ReceivedPaymentStatusPendingLinkRequest
	}

	var err error

	receivedPayment.ID, err = h.DB.CreateReceivedPayment(receivedPayment)
	if err != nil {
		h.Logger.Error("Unable to create received payment",
			zap.Error(err),
			zap.Any("Payment", payment),
			zap.Any("Received payment", receivedPayment),
		)
		return
	}

	if ethAddress == nil {
		return
	}

	linkRequest := db.LinkRequest{
		ReceivedPaymentID: receivedPayment.ID,
		EthereumAddress:   *ethAddress,
		Status:            db.LinkRequestStatusPendingValidation,
	}
	linkRequest.ID, err = h.DB.CreateLinkRequest(linkRequest)
	if err != nil {
		h.Logger.Error("Unable to create link request",
			zap.Error(err),
			zap.Any("Link Request", linkRequest),
			zap.Any("Received payment", receivedPayment),
		)
		return
	}

	h.Logger.Debug("Enqueue link request",
		zap.Any("Link Request", linkRequest),
		zap.Any("Received payment", receivedPayment),
	)
	h.LinkRequests <- linkRequest
}

func (h *StellarPaymentHandler) parseMemo(payment *horizon.Payment) (ethAddress *string, memo null.String, memoType stellar.MemoType) {
	err := h.HorizonClient.LoadMemo(payment)

	if err != nil {
		h.Logger.Error("Failed to load memo for payment", zap.Any("Payment", payment))
	} else {
		memo = null.NewString(payment.Memo.Value, payment.Memo.Value != "")

		var ok bool
		memoType, ok = stellar.ToMemoType(payment.Memo.Type)

		if !ok || memoType != stellar.MemoTypeHash {
			h.Logger.Info("Unable to parse ethereum address from invalid memo type",
				zap.String("Memo Type", payment.Memo.Type),
				zap.String("Memo Value", payment.Memo.Value),
				zap.Any("Payment", payment),
			)
		} else {
			address, err := stellar.ExtractMemoToEthereumAddress(payment.Memo.Type, payment.Memo.Value)
			if err != nil {
				h.Logger.Info("Unable to parse ethereum address from memo",
					zap.Error(err),
					zap.Any("Payment", payment),
				)
			} else {
				ethAddress = &address
			}
		}
	}

	return
}
