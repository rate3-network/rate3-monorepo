import { all, call, put, takeEvery, select } from 'redux-saga/effects';
import { networkActions } from '../actions/network';

function* getBalance() {
  try {
    const getWeb3 = state => state.network.web3Obj;
    const web3 = yield select(getWeb3);
    const address = web3.eth.accounts.wallet[0].address;
    const balance = yield web3.eth.getBalance(address);
    return balance;
  } catch (e) {
    throw e;
  }
}

function* getUserEthBalance(action: any) {
  try {
    const balance = yield getBalance();
    yield put({ type: networkActions.SET_USER_ETH_BALANCE, payload: { balance } });
  } catch (e) {
    console.error(e);
  }
}
function* getIssuerEthBalance(action: any) {
  try {
    const balance = yield getBalance();
    yield put({ type: networkActions.SET_ISSUER_ETH_BALANCE, payload: { balance } });
  } catch (e) {
    console.error(e);
  }
}
export default function* network() {
  yield takeEvery(networkActions.INIT_USER, getUserEthBalance);
  yield takeEvery(networkActions.INIT_ISSUER, getIssuerEthBalance);
}
