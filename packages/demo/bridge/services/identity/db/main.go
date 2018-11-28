package db

import (
	"time"

	"github.com/gocraft/dbr"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/stellar"
	"go.uber.org/zap"
	"gopkg.in/guregu/null.v3"
)

// Values for ReceivedPayments status column
const (
	ReceivedPaymentStatusMissingMemo = iota
	ReceivedPaymentStatusInvalidMemoType
	ReceivedPaymentStatusInvalidMemoFormat
	ReceivedPaymentStatusPendingLinkRequest
)

// Values for LinkRequests status column
const (
	LinkRequestStatusPendingValidation = iota
	LinkRequestStatusValidationFailed
	LinkRequestStatusQueued
	LinkRequestStatusSuccess
	LinkRequestStatusError
)

// Database contains methods for interacting with a storage instance.
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

	// Updates the tx_hash, sender_address, nonce, status, and remarks columns.
	UpdateLinkRequest(request LinkRequest) (int64, error)

	// Loads an ethereum contract from the database given an address. A new
	// contract will be inserted if no contracts with the address exists.
	LoadContract(address string) (*Contract, error)

	// Inserts StellarIdentityAccounts contract events up to the specified block
	// number, updates the contract with this latest synced block number.
	AddStellarIdentityAccountsEventsUntilBlockNumber(contractID int64, blockNumber uint64, events []StellarIdentityAccountsEvent) error
}

// PostgresDB is an implementation of Database.
type PostgresDB struct {
	*dbr.Connection
	Logger *zap.Logger
}

// Timestamp contains the last created and last updated db columns.
type Timestamp struct {
	LastCreated  time.Time `db:"last_created"`
	LastModified time.Time `db:"last_modified"`
}

// StellarAccount contains the db columns for stellar_accounts.
type StellarAccount struct {
	ID      int64       `db:"id"`
	Address string      `db:"address"`
	Cursor  null.String `db:"cursor"`
	Status  int64       `db:"status"`
	Timestamp
}

// ReceivedPayment contains the db columns for received_payments.
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

// LinkRequest contains the db columns for link_requests.
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

// Contract contains the db columns for contracts.
type Contract struct {
	ID          int64  `db:"id"`
	Address     string `db:"contract_address"`
	BlockNumber uint64 `db:"block_number"`
	Timestamp
}

// StellarIdentityAccountsEvent contains the db columns for stellar_identity_accounts_events.
type StellarIdentityAccountsEvent struct {
	ID              int64     `db:"id"`
	ContractID      int64     `db:"contract_id"`
	EventName       string    `db:"event_name"`
	IdentityAddress string    `db:"identity_address"`
	AccountAddress  string    `db:"account_address"`
	TxHash          string    `db:"tx_hash"`
	BlockNumber     uint64    `db:"block_number"`
	TxIndex         uint      `db:"tx_index"`
	BlockTimestamp  time.Time `db:"block_timestamp"`
	Timestamp
}

// NewPostgresDB creates a new instance of Database backed by a postgresql db.
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
