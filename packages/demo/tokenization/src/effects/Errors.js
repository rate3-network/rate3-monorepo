import {
  all,
  put,
  takeEvery,
} from 'redux-saga/effects';
import { errorActions } from '../actions/Errors';


const transactions = (db, web3) => {
  function* handleErrors(action) {
    return yield put({
      type: errorActions.NEW,
      message: action.error,
    });
  }

  return function* watchTransactions() {
    yield all([
      takeEvery(action => action.error != null, handleErrors),
    ]);
  };
};

export default transactions;
