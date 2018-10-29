package db

import (
	"go.uber.org/zap/zapcore"
)

func (o StellarAccount) MarshalLogObject(enc zapcore.ObjectEncoder) error {
	enc.AddInt64("ID", o.ID)
	enc.AddString("Address", o.Address)
	if o.Cursor.Valid {
		enc.AddString("Cursor", o.Cursor.String)
	} else {
		enc.AddReflected("Cursor", nil)
	}
	enc.AddInt64("Status", o.Status)
	enc.AddTime("Last created", o.LastCreated)
	enc.AddTime("Last modified", o.LastModified)
	return nil
}

func (o ReceivedPayment) MarshalLogObject(enc zapcore.ObjectEncoder) error {
	enc.AddInt64("ID", o.ID)
	enc.AddInt64("To account ID", o.ToAccountID)
	enc.AddString("From account", o.FromAccount)
	enc.AddInt64("Payment ID", o.PaymentID)
	enc.AddString("TxHash", o.TxHash)
	enc.AddString("Paging token", o.PagingToken)
	enc.AddInt64("Status", o.Status)
	enc.AddInt64("Memo type value", int64(o.MemoType))
	if o.Memo.Valid {
		enc.AddString("Memo", o.Memo.String)
	}
	enc.AddTime("Last created", o.LastCreated)
	enc.AddTime("Last modified", o.LastModified)
	return nil
}

func (o LinkRequest) MarshalLogObject(enc zapcore.ObjectEncoder) error {
	enc.AddInt64("ID", o.ID)
	enc.AddInt64("Received payment id", o.ReceivedPaymentID)
	enc.AddString("From stellar account", o.StellarAccount)
	enc.AddString("Ethereum address", o.EthereumAddress)
	if o.TxHash.Valid {
		enc.AddString("TxHash", o.TxHash.String)
	}
	if o.SenderAddress.Valid {
		enc.AddString("Sender address", o.SenderAddress.String)
	}
	if o.Nonce.Valid {
		enc.AddInt64("Nonce", o.Nonce.Int64)
	}
	enc.AddInt64("Status", o.Status)
	if o.Remarks.Valid {
		enc.AddString("Remarks", o.Remarks.String)
	}
	enc.AddTime("Last created", o.LastCreated)
	enc.AddTime("Last modified", o.LastModified)
	return nil
}

func (o Contract) MarshalLogObject(enc zapcore.ObjectEncoder) error {
	enc.AddInt64("ID", o.ID)
	enc.AddString("Address", o.Address)
	enc.AddUint64("Block number", o.BlockNumber)
	enc.AddTime("Last created", o.LastCreated)
	enc.AddTime("Last modified", o.LastModified)
	return nil
}

func (o StellarIdentityAccountsEvent) MarshalLogObject(enc zapcore.ObjectEncoder) error {
	enc.AddInt64("ID", o.ID)
	enc.AddInt64("Contract ID", o.ContractID)
	enc.AddString("Event name", o.EventName)
	enc.AddString("Identity address", o.IdentityAddress)
	enc.AddString("Stellar account address", o.AccountAddress)
	enc.AddUint64("Block number", o.BlockNumber)
	enc.AddUint("Transaction index", o.TxIndex)
	enc.AddTime("Block timestamp", o.BlockTimestamp)
	enc.AddTime("Last created", o.LastCreated)
	enc.AddTime("Last modified", o.LastModified)
	return nil
}
