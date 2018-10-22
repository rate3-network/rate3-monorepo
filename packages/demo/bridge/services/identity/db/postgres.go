package db

import (
	"github.com/gocraft/dbr"
	"go.uber.org/zap"
)

func (d *PostgresDB) LoadStellarAccount(address string) (*StellarAccount, error) {
	sess := d.Connection.NewSession(nil)

	res := &StellarAccount{}

	err := sess.
		Select("*").
		From(tableStellarAccounts).
		Where(dbr.And(
			dbr.Eq(columnAddress, address),
		)).
		LoadOne(res)

	if err == nil {
		return res, nil
	}

	if err != nil && err != dbr.ErrNotFound {
		return nil, err
	}

	tx, err := sess.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.RollbackUnlessCommitted()

	var id int64
	err = tx.
		InsertInto(tableStellarAccounts).
		Columns(columnAddress).
		Values(address).
		Returning(columnID).
		Load(&id)
	if err != nil {
		return nil, err
	}

	err = tx.
		Select("*").
		From(tableStellarAccounts).
		Where(dbr.And(
			dbr.Eq(columnID, id),
		)).
		LoadOne(res)
	if err != nil {
		return nil, err
	}

	return res, tx.Commit()
}

func (d *PostgresDB) CreateReceivedPayment(payment ReceivedPayment) (int64, error) {
	sess := d.Connection.NewSession(nil)
	tx, err := sess.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.RollbackUnlessCommitted()

	var accountCursor dbr.NullString
	var currentPaymentID int64

	err = tx.
		Select(columnCursor).
		From(tableStellarAccounts).
		Where(dbr.And(
			dbr.Eq(columnID, payment.ToAccountID),
		)).
		LoadOne(&accountCursor)
	if err != nil {
		d.Logger.Error("Failed to get current cursor",
			zap.Error(err),
			zap.Int64(columnID, payment.ToAccountID),
		)
		return 0, err
	}

	if accountCursor.Valid {
		err = tx.
			Select(columnPagingToken).
			From(tableReceivedPayments).
			Where(dbr.And(
				dbr.Eq(columnToAccountID, payment.ToAccountID),
				dbr.Eq(columnPagingToken, accountCursor.String),
			)).
			LoadOne(&currentPaymentID)
		if err != nil && err != dbr.ErrNotFound {
			d.Logger.Error("Failed to get payment id",
				zap.Error(err),
				zap.Int64(columnToAccountID, payment.ToAccountID),
				zap.String(columnPagingToken, accountCursor.String),
			)
			return 0, err
		}
	}

	var id int64
	err = tx.
		InsertInto(tableReceivedPayments).
		Columns(
			columnToAccountID,
			columnFromAccount,
			columnPaymentID,
			columnTxHash,
			columnPagingToken,
			columnStatus,
			columnMemoType,
			columnMemo,
		).
		Record(payment).
		Returning(columnID).
		Load(&id)
	if err != nil {
		d.Logger.Error("Failed to insert received payment",
			zap.Error(err),
			zap.Any("payment", payment),
		)
		return 0, err
	}

	if !accountCursor.Valid || currentPaymentID < payment.PaymentID {
		_, err = tx.
			Update(tableStellarAccounts).
			Set(columnCursor, payment.PagingToken).
			Where(dbr.And(
				dbr.Eq(columnID, payment.ToAccountID),
			)).
			Exec()
		if err != nil {
			d.Logger.Error("Failed to update account cursor",
				zap.Error(err),
				zap.String(columnCursor, payment.PagingToken),
			)
			return 0, err
		}
	}

	return id, tx.Commit()
}

func (d *PostgresDB) CreateLinkRequest(request LinkRequest) (int64, error) {
	sess := d.Connection.NewSession(nil)

	var id int64
	err := sess.
		InsertInto(tableLinkRequests).
		Columns(
			columnReceivedPaymentID,
			columnEthereumAddress,
			columnTxHash,
			columnStatus,
			columnRemarks,
		).
		Record(request).
		Returning(columnID).
		Load(&id)
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (d *PostgresDB) SetStellarAccountCursor(id int64, cursor string) (int64, error) {
	sess := d.Connection.NewSession(nil)

	results, err := sess.
		Update(tableStellarAccounts).
		Set(columnCursor, cursor).
		Exec()
	if err != nil {
		return 0, err
	}

	return results.RowsAffected()
}
