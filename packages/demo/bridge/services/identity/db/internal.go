package db

import (
	"database/sql/driver"
	"time"

	"github.com/gocraft/dbr/dialect"
)

// Tables
const (
	tableStellarAccounts  = "stellar_accounts"
	tableReceivedPayments = "stellar_received_payments"
	tableLinkRequests     = "link_requests"
)

// Columns
const (
	columnID           = "id"
	columnLastCreated  = "last_created"
	columnLastModified = "last_modified"
	columnStatus       = "status"
	columnRemarks      = "remarks"

	columnAddress = "address"
	columnCursor  = "cursor"

	columnToAccountID = "to_account_id"
	columnFromAccount = "from_account"
	columnPaymentID   = "payment_id"
	columnTxHash      = "tx_hash"
	columnPagingToken = "paging_token"
	columnMemoType    = "memo_type"
	columnMemo        = "memo"

	columnReceivedPaymentID = "received_payment_id"
	columnEthereumAddress   = "ethereum_address"
	columnSenderAddress     = "sender_address"
	columnNonce             = "nonce"
)

// pgTimeFormat is RFC3339 which has timezone information and accepted by pg
var pgTimeFormat = time.RFC3339

// pgTimezone implements dbr.Dialect and adds in the extra timestamp formatting
// step.
type pgTimezone struct{}

// QuoteIdent serves the same functionality as dialect.PostgreSQL.QuoteIdent.
func (d pgTimezone) QuoteIdent(s string) string {
	return dialect.PostgreSQL.QuoteIdent(s)
}

// EncodeString serves the same functionality as dialect.PostgreSQL.EncodeString.
func (d pgTimezone) EncodeString(s string) string {
	return dialect.PostgreSQL.EncodeString(s)
}

// EncodeBool serves the same functionality as dialect.PostgreSQL.EncodeBool.
func (d pgTimezone) EncodeBool(b bool) string {
	return dialect.PostgreSQL.EncodeBool(b)
}

// EncodeTime encodes the timestamp using the PgTimeFormat.
func (d pgTimezone) EncodeTime(t time.Time) string {
	return `'` + t.UTC().Format(pgTimeFormat) + `'`
}

// EncodeBytes serves the same functionality as dialect.PostgreSQL.EncodeBytes.
func (d pgTimezone) EncodeBytes(b []byte) string {
	return dialect.PostgreSQL.EncodeBytes(b)
}

// Placeholder serves the same functionality as dialect.PostgreSQL.Placeholder.
func (d pgTimezone) Placeholder(n int) string {
	return dialect.PostgreSQL.Placeholder(n)
}

// sql now utility function with timezone
type pgBetterNowSentinel struct{}

// pgNowTZ replaces dbr.Now
// NOTE: DO NOT USE dbr.Now unless db is timezone is in UTC
var pgNowTZ = pgBetterNowSentinel{}

func (n pgBetterNowSentinel) Value() (driver.Value, error) {
	now := time.Now().UTC().Format(pgTimeFormat)
	return now, nil
}
