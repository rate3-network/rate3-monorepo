package db

import (
	"github.com/gocraft/dbr"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/stellar"
	"go.uber.org/zap"
	"gopkg.in/guregu/null.v3"
)

const (
	ReceivedPaymentStatusMissingMemo = iota
	ReceivedPaymentStatusInvalidMemoType
	ReceivedPaymentStatusInvalidMemoFormat
	ReceivedPaymentStatusPendingLinkRequest
)

const (
	LinkRequestStatusPendingValidation = iota
	LinkRequestStatusValidationFailed
	LinkRequestStatusQueued
	LinkRequestStatusSuccess
	LinkRequestStatusError
)

type Database interface {
	// Loads a stellar account from the database given an stellar address. A new
	// account will be inserted if no account exists.
	LoadStellarAccount(address string) (*StellarAccount, error)

	CreateReceivedPayment(payment ReceivedPayment) (int64, error)
	CreateLinkRequest(request LinkRequest) (int64, error)

	SetStellarAccountCursor(id int64, cursor string) (int64, error)

	// Gets the next link request for processing, sets the sender address for the
	// link request to process.
	// This operation locks the table to ensure that no link request can be
	// process by multiple workers at the same time.
	GetNextLinkRequest(senderAddress string) (*LinkRequest, error)

	UpdateLinkRequest(request LinkRequest) (int64, error)
}

type PostgresDB struct {
	*dbr.Connection
	Logger *zap.Logger
}

type Timestamp struct {
	LastCreated  string `db:"last_created"`
	LastModified string `db:"last_modified"`
}

type StellarAccount struct {
	ID      int64       `db:"id"`
	Address string      `db:"address"`
	Cursor  null.String `db:"cursor"`
	Status  int64       `db:"status"`
	Timestamp
}

type ReceivedPayment struct {
	ID          int64            `db:"id"`
	ToAccountID int64            `db:"to_account_id"`
	FromAccount string           `db:"from_account"`
	PaymentID   int64            `db:"payment_id"`
	TxHash      string           `db:"tx_hash"`
	PagingToken string           `db:"paging_token"`
	Status      int64            `db:"status"`
	MemoType    stellar.MemoType `db:"memo_type"`
	Memo        null.String      `db:"memo"`
	Timestamp
}

type LinkRequest struct {
	ID                int64       `db:"id"`
	ReceivedPaymentID int64       `db:"received_payment_id"`
	StellarAccount    string      `db:"from_account"`
	EthereumAddress   string      `db:"ethereum_address"`
	TxHash            null.String `db:"tx_hash"`
	SenderAddress     null.String `db:"sender_address"`
	Nonce             null.Int    `db:"nonce"`
	Status            int64       `db:"status"`
	Remarks           null.String `db:"remarks"`
	Timestamp
}

func NewPostgresDB(pgURL string, logger *zap.Logger) (Database, error) {
	eventReceiver := DbrTracer{Logger: logger}

	conn, err := dbr.Open("postgres", pgURL, &eventReceiver)
	if err != nil {
		return nil, err
	}
	conn.Dialect = pgTimezone{}

	return &PostgresDB{
		Connection: conn,
		Logger:     logger,
	}, nil
}
