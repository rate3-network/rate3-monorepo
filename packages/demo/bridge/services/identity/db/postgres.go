package db

import (
	"fmt"

	"github.com/gocraft/dbr"
	"go.uber.org/zap"
	"gopkg.in/guregu/null.v3"
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

func (d *PostgresDB) GetNextLinkRequest(senderAddress string) (*LinkRequest, error) {
	sess := d.Connection.NewSession(nil)
	tx, err := sess.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.RollbackUnlessCommitted()

	_, err = tx.Exec(fmt.Sprintf("LOCK TABLE %s IN ACCESS EXCLUSIVE MODE;", tableLinkRequests))
	if err != nil {
		d.Logger.Warn("Unable to lock link request table", zap.Error(err))
		return nil, err
	}

	var res LinkRequest

	err = tx.
		Select(
			fmt.Sprintf("%s.*", tableLinkRequests),
			fmt.Sprintf("%s.%s", tableReceivedPayments, columnFromAccount),
		).
		From(tableLinkRequests).
		LeftJoin(
			tableReceivedPayments, fmt.Sprintf("%s.%s = %s.%s",
				tableLinkRequests, columnReceivedPaymentID,
				tableReceivedPayments, columnID),
		).
		Where(dbr.And(
			dbr.Eq(
				fmt.Sprintf("%s.%s", tableLinkRequests, columnStatus),
				LinkRequestStatusPendingValidation,
			),
			dbr.Eq(
				fmt.Sprintf("%s.%s", tableLinkRequests, columnSenderAddress),
				nil,
			),
		)).
		OrderDir(columnLastCreated, true).
		Limit(1).
		LoadOne(&res)

	if err != nil {
		if err == dbr.ErrNotFound {
			return nil, nil
		}
		return nil, err
	}

	_, err = tx.
		Update(tableLinkRequests).
		Set(columnSenderAddress, senderAddress).
		Where(dbr.And(
			dbr.Eq(columnID, res.ID),
		)).
		Exec()

	if err != nil {
		return nil, err
	}

	res.SenderAddress = null.NewString(senderAddress, true)

	return &res, tx.Commit()
}

func (d *PostgresDB) UpdateLinkRequest(request LinkRequest) (int64, error) {
	sess := d.Connection.NewSession(nil)

	res, err := sess.
		Update(tableLinkRequests).
		SetMap(map[string]interface{}{
			columnTxHash:        request.TxHash,
			columnSenderAddress: request.SenderAddress,
			columnNonce:         request.Nonce,
			columnStatus:        request.Status,
			columnRemarks:       request.Remarks,
		}).
		Where(dbr.And(
			dbr.Eq(columnID, request.ID),
		)).
		Exec()
	if err != nil {
		return 0, err
	}

	return res.RowsAffected()
}

func (d *PostgresDB) LoadContract(address string) (*Contract, error) {
	sess := d.Connection.NewSession(nil)

	res := &Contract{}

	err := sess.
		Select("*").
		From(tableContracts).
		Where(dbr.And(
			dbr.Eq(columnContractAddress, address),
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
		InsertInto(tableContracts).
		Columns(columnContractAddress).
		Values(address).
		Returning(columnID).
		Load(&id)
	if err != nil {
		return nil, err
	}

	err = tx.
		Select("*").
		From(tableContracts).
		Where(dbr.And(
			dbr.Eq(columnID, id),
		)).
		LoadOne(res)
	if err != nil {
		return nil, err
	}

	return res, tx.Commit()
}

func (d *PostgresDB) AddStellarIdentityAccountsEventsUntilBlockNumber(contractID int64, blockNumber uint64, events []StellarIdentityAccountsEvent) error {
	sess := d.Connection.NewSession(nil)
	tx, err := sess.Begin()
	if err != nil {
		return err
	}
	defer tx.RollbackUnlessCommitted()

	for _, ev := range events {
		var count int64
		_, err = tx.
			Select("COUNT(*)").
			From(tableStellarIdentityAccountsEvents).
			Where(dbr.And(
				dbr.Eq(columnTxHash, ev.TxHash),
			)).
			Load(&count)
		if err != nil {
			return err
		} else if count > 0 {
			continue // event exists
		}

		_, err = tx.
			InsertInto(tableStellarIdentityAccountsEvents).
			Columns(
				columnContractID,
				columnEventName,
				columnIdentityAddress,
				columnAccountAddress,
				columnTxHash,
				columnBlockNumber,
				columnTxIndex,
				columnBlockTimestamp,
			).
			Record(ev).
			Exec()
		if err != nil {
			return err
		}
	}

	_, err = tx.
		Update(tableContracts).
		Set(columnBlockNumber, blockNumber).
		Where(dbr.Eq(columnID, contractID)).
		Exec()

	if err != nil {
		return err
	}

	return tx.Commit()
}
