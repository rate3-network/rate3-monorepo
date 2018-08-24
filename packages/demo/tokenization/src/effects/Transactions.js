import {
  all,
  put,
  select,
  takeEvery,
} from 'redux-saga/effects';
import { transactionsActions } from '../actions/Transactions';


const transactions = (db, web3) => {
  function* handleFilter(action) {
    const { filterType, filterStatus } = action;
    const walletState = yield select(state => state.wallet);
    const { isUser, currentDefaultAccount } = walletState;

    const filter = {};
    if (filterType) {
      filter.type = val => Boolean(filterType[val]);
    }
    if (filterStatus) {
      filter.status = val => Boolean(filterStatus[val]);
    }

    let txns = [];

    if (isUser) {
      txns = db.select('transactions', {
        from: currentDefaultAccount,
        ...filter,
      });
    } else {
      txns = db.select('transactions', {
        to: currentDefaultAccount,
        ...filter,
      });
    }


    yield put({
      type: transactionsActions.SET_CURRENT_TRANSACTIONS,
      transactions: txns,
      filterType,
      filterStatus,
    });
  }

  return function* watchTransactions() {
    yield all([
      takeEvery(transactionsActions.SET_CURRENT_FILTER, handleFilter),
    ]);
  };
};

export default transactions;
