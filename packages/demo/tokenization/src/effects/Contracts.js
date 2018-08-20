import {
  all,
  put,
  call,
  takeEvery,
} from 'redux-saga/effects';
import { tokenizeActions } from '../actions/Tokenize';

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function* handleTokenize(action) {
  const { type } = action;
  switch (type) {
    case tokenizeActions.SUBMIT_TOKENIZE_REQUEST: {
      const {
        amount,
        gasLimit,
        gasPrice,
      } = action;

      console.log('Simulating smart contract call, wait 1s');
      yield call(delay, 1000);
      yield put({
        type: `${type}_HASH`,
        hash: '0xSOME_DUMMY_HASH',
      });

      console.log('Simulating receipt, wait 1s');
      yield call(delay, 1000);
      yield put({
        type: `${type}_RECEIPT`,
        receipt: {},
      });

      console.log('Simulating success, wait 1s');
      yield call(delay, 1000);
      return yield put({
        type: `${type}_CONFIRMATION`,
        confirmation: 1,
      });
    }
    default:
      return yield all([]);
  }
}


export default function* () {
  yield all([
    takeEvery(tokenizeActions.SUBMIT_TOKENIZE_REQUEST, handleTokenize),
  ]);
}
