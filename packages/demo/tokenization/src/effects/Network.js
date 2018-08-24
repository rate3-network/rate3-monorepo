import {
  all,
  put,
  call,
  takeLatest,
} from 'redux-saga/effects';

import { networkActions } from '../actions/Network';
import { walletActions } from '../actions/Wallet';
import { contractAddresses } from '../constants/addresses';
import tokenContractAbi from '../contracts/token';
import operationsContractAbi from '../contracts/operations';

const network = (db, web3) => {
  function* handleInit(action) {
    const { type } = action;
    switch (type) {
      case networkActions.INIT: {
        yield put({ type: networkActions.CHANGE });
        const accounts = [];
        let id;

        try {
          id = yield call(web3.eth.net.getId);
          let addresses = contractAddresses[id];
          if (!addresses) {
            addresses = contractAddresses.local;
          }
          const tokenContract = new web3.eth.Contract(
            tokenContractAbi,
            addresses.token,
          );
          const operationsContract = new web3.eth.Contract(
            operationsContractAbi,
            addresses.operations,
          );

          yield put({
            type: networkActions.SET_CONTRACTS,
            tokenContract,
            operationsContract,
          });
        } catch (err) {
          console.error(err);
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

        const accountsRaw = yield call(web3.eth.getAccounts);
        for (const hash of accountsRaw) {
          const balanceWei = yield call(web3.eth.getBalance, hash);
          accounts.push({
            hash,
            balanceWei,
            balance: balanceWei,
          });
        }

        yield put({ type: walletActions.INIT });

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

  return function* watchNetwork() {
    yield all([
      takeLatest(networkActions.INIT, handleInit),
    ]);
  };
};

export default network;
