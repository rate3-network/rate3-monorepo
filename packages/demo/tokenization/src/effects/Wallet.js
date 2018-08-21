import {
  all,
  put,
  select,
  takeEvery,
} from 'redux-saga/effects';
import { walletActions } from '../actions/Wallet';
import { transactionsActions } from '../actions/Transactions';


const wallet = (db) => {
  function* handleActions(action) {
    const { type } = action;
    switch (type) {
      case walletActions.INIT:
      case walletActions.SWITCH_ROLE: {
        const walletState = yield select(state => state.wallet);
        const { isUser, currentDefaultAccount } = walletState;

        if (isUser) {
          yield put({
            type: transactionsActions.SET_CURRENT_TRANSACTIONS,
            transactions: db.select('transactions', {
              from: currentDefaultAccount,
            }),
            filterType: null,
            filterStatus: null,
          });
        } else {
          yield put({
            type: transactionsActions.SET_CURRENT_TRANSACTIONS,
            transactions: db.select('transactions', {
              to: currentDefaultAccount,
            }),
            filterType: null,
            filterStatus: null,
          });
        }

        return yield put({
          type: `${type}_SUCCESS`,
        });
      }
      default:
        return yield all([]);
    }
  }

  return function* watchWallet() {
    yield all([
      takeEvery(
        action => action.type === walletActions.SWITCH_ROLE
         || action.type === walletActions.INIT,
        handleActions,
      ),
    ]);
  };
};

export default wallet;
