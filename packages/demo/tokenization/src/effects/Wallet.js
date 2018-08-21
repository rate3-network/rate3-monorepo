import {
  all,
  put,
  select,
  takeEvery,
} from 'redux-saga/effects';
import { walletActions } from '../actions/Wallet';
import { transactionsActions } from '../actions/Transactions';
import { txStatus } from '../constants/enums';


const wallet = (db) => {
  function* handleActions(action) {
    const { type } = action;
    switch (type) {
      case walletActions.INIT:
      case walletActions.SWITCH_ROLE: {
        const walletState = yield select(state => state.wallet);
        const { isUser, userDefaultAccount, issuerDefaultAccount } = walletState;

        // Use `isUser` only for init, switch role should use the opposite case
        if (isUser && type === walletActions.INIT) {
          yield put({
            type: transactionsActions.SET_CURRENT_TRANSACTIONS,
            transactions: db.select('transactions', {
              from: userDefaultAccount,
            }),
            filterType: null,
            filterStatus: null,
          });
        } else {
          yield put({
            type: transactionsActions.SET_CURRENT_TRANSACTIONS,
            transactions: db.select('transactions', {
              to: issuerDefaultAccount,
            }),
            filterType: null,
            filterStatus: null,
          });
          yield put({
            type: transactionsActions.SET_PENDING_APPROVAL_TRANSACTIONS,
            transactions: db.select('transactions', {
              to: issuerDefaultAccount,
              status: txStatus.PENDING_APPROVAL,
            }),
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
