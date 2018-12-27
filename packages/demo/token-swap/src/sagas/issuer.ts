import { all, call, put, takeLatest, select } from 'redux-saga/effects';
import { issuerActions } from '../actions/issuer';
import localforage from 'localforage'; // tslint:disable-line:import-name
import {
  ETH_ISSUER,
  ETH_USER,
  localForageConfig,
  STELLAR_DISTRIBUTOR_SECRET,
  STELLAR_DISTRIBUTOR,
  STELLAR_ISSUER_SECRET,
  STELLAR_ISSUER,
  STELLAR_MEMO_PREPEND,
  STELLAR_USER_SECRET,
  STELLAR_USER,
} from '../constants/defaults';

localforage.config(localForageConfig);
function* fetchE2S() {
  try {
    const resultList: any[] = [];
    const result = yield localforage.iterate((value: any, key, iterationNumber) => {
      if (value.type === 'E2S') {
        resultList.push(value);
      }
    });
    console.log(resultList);
    yield put({ type: issuerActions.SET_E2S_APPROVAL_LIST, payload: resultList });
    return resultList;
  } catch (err) {
    throw err;
  }
}
function* fetchS2E() {
  console.log(123);
  try {
    const resultList: any[] = [];
    const result = yield localforage.iterate((value: any, key, iterationNumber) => {
      if (value.type === 'S2E') {
        resultList.push(value);
      }
    });
    console.log(resultList);
    yield put({ type: issuerActions.SET_S2E_APPROVAL_LIST, payload: resultList });
    return resultList;
  } catch (err) {
    throw err;
  }
}

function* approveE2S() {
  yield fetchE2S();
}
function* approveS2E() {
  yield fetchS2E();
}
export default function* network() {
  yield takeLatest(issuerActions.FETCH_ETH_TO_STELLAR, fetchE2S);
  yield takeLatest(issuerActions.FETCH_STELLAR_TO_ETH, fetchS2E);
  // yield takeLatest(networkActions.INIT_ISSUER, setUp);
}
