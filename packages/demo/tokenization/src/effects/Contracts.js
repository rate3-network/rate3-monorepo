import {
  all,
  put,
  call,
  select,
  takeEvery,
} from 'redux-saga/effects';
import { tokenizeActions } from '../actions/Tokenize';
import { withdrawActions } from '../actions/Withdraw';
import { approveActions } from '../actions/Approve';

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const contracts = (db, web3) => {
  function* handleTokenize(action) {
    const {
      type,
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

  function* handleWithdraw(action) {
    const {
      type,
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

  function* handleApprove(action) {
    const {
      type,
      requestId,
      requesterAddr,
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

  return function* watchContracts() {
    yield all([
      takeEvery(tokenizeActions.SUBMIT_TOKENIZE_REQUEST, handleTokenize),
      takeEvery(withdrawActions.SUBMIT_WITHDRAW_REQUEST, handleWithdraw),
      takeEvery(approveActions.SUBMIT_APPROVE_REQUEST, handleApprove),
    ]);
  };
};

export default contracts;
