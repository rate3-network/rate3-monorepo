import {
  all,
  put,
  select,
  takeEvery,
} from 'redux-saga/effects';
import { transactionsActions } from '../actions/Transactions';
import { txStatus, txType } from '../constants/enums';


const transactions = (db, web3) => {
  function* handleFilter(action) {
    const { filterType, filterStatus } = action;
    const { id: networkId, operationsContract } = yield select(state => state.network);
    const walletState = yield select(state => state.wallet);
    const { isUser, currentDefaultAccount } = walletState;

    return yield put({
      type: transactionsActions.LOAD,
      filterType,
      filterStatus,
      networkId,
      isUser,
      currentDefaultAccount,
      operationsContractAddress: operationsContract.options.address,
      resetPage: true,
    });
  }

  function* loadTransactions(action) {
    const {
      filterType,
      filterStatus,
      networkId,
      isUser,
      currentDefaultAccount,
      operationsContractAddress,
      resetPage,
    } = action;

    const filter = {};
    if (filterType) {
      filter.type = val => Boolean(filterType[val]);
    }
    if (filterStatus) {
      filter.status = val => Boolean(filterStatus[val]);
    }

    const nextActions = [];
    const transactionsTable = `transactions_${networkId}`;

    if (isUser) {
      nextActions.push(put({
        type: transactionsActions.SET_CURRENT_TRANSACTIONS,
        transactions: db.select(transactionsTable, {
          from: currentDefaultAccount,
          ...filter,
        }),
        filterType,
        filterStatus,
        resetPage,
      }));
    } else {
      nextActions.push(put({
        type: transactionsActions.SET_CURRENT_TRANSACTIONS,
        transactions: db.select(transactionsTable, {
          to: operationsContractAddress,
          ...filter,
        }),
        filterType,
        filterStatus,
        resetPage,
      }));
      nextActions.push(put({
        type: transactionsActions.SET_PENDING_APPROVAL_TRANSACTIONS,
        transactions: db.select(transactionsTable, {
          to: operationsContractAddress,
          type: txType.TOKENIZE,
          status: txStatus.PENDING_APPROVAL,
        }),
        resetPage,
      }));
      nextActions.push(put({
        type: transactionsActions.SET_PENDING_FINALIZE_TRANSACTIONS,
        transactions: db.select(transactionsTable, {
          to: operationsContractAddress,
          type: txType.TOKENIZE,
          status: txStatus.PENDING_FINALIZE,
        }),
        resetPage,
      }));
    }

    yield all(nextActions);
  }

  return function* watchTransactions() {
    yield all([
      takeEvery(transactionsActions.SET_CURRENT_FILTER, handleFilter),
      takeEvery(transactionsActions.LOAD, loadTransactions),
    ]);
  };
};

export default transactions;
