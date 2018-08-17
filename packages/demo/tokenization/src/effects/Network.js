import {
  all,
  put,
  call,
  takeLatest,
} from 'redux-saga/effects';
import { networkActions } from '../actions/Network';


function* handleInit(action) {
  const { type } = action;
  switch (type) {
    case networkActions.INIT: {
      yield put({ type: networkActions.CHANGE });
      const accounts = [];
      let id;

      try {
        id = yield call(window.web3.eth.net.getId);
      } catch (err) {
        return yield all([
          put({
            type: networkActions.CHANGE_ERROR,
            // TODO translate
            error: 'Network unavailable',
          }),
        ]);
      }

      if (!id) {
        return yield all([]);
      }

      const accountsRaw = yield call(window.web3.eth.getAccounts);
      for (const hash of accountsRaw) {
        const balanceWei = yield call(window.web3.eth.getBalance, hash);
        accounts.push({
          hash,
          balanceWei,
          balance: balanceWei,
        });
      }

      return yield put({
        type: networkActions.CHANGE_SUCCESS,
        id,
        accounts,
      });
    }
    default:
      return yield all([]);
  }
}


export default function* () {
  yield all([
    takeLatest(networkActions.INIT, handleInit),
  ]);
}