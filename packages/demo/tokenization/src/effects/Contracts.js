import {
  all,
  put,
  call,
  takeEvery,
} from 'redux-saga/effects';
import { tokenizeActions } from '../actions/Tokenize';
import { withdrawActions } from '../actions/Withdraw';

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const contracts = (db) => {
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

  function* handleWithdraw(action) {
    const { type } = action;
    switch (type) {
      case withdrawActions.SUBMIT_WITHDRAW_REQUEST: {
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

  return function* watchContracts() {
    yield all([
      takeEvery(tokenizeActions.SUBMIT_TOKENIZE_REQUEST, handleTokenize),
      takeEvery(withdrawActions.SUBMIT_WITHDRAW_REQUEST, handleWithdraw),
    ]);
  };
};

export default contracts;