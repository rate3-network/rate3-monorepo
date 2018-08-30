import {
  all,
  put,
  call,
  fork,
  select,
  takeLatest,
} from 'redux-saga/effects';

import { networkActions } from '../actions/Network';
import { transactionsActions } from '../actions/Transactions';
import { walletActions } from '../actions/Wallet';
import { contractAddresses } from '../constants/addresses';
import tokenContractAbi from '../contracts/token';
import operationsContractAbi from '../contracts/operations';
import { txType, txStatus } from '../constants/enums';
import { userPrivKey, trusteePrivKey } from '../constants/defaults';

const delay = ms => new Promise(res => setTimeout(res, ms));

// eslint-disable-next-line no-underscore-dangle
function* _retryCall(args, delayTime, maxRetry) {
  for (let i = 0; i < maxRetry; i += 1) {
    try {
      const order = yield call(...args);
      return order;
    } catch (err) {
      if (i < maxRetry - 1) {
        yield call(delay, delayTime);
      }
    }
  }
  throw new Error('Max retries reached');
}

const network = (db, web3) => {
  function* handleInit(action) {
    yield put({ type: networkActions.CHANGE });
    const { isUser } = action;
    const { isUser: currentIsUser } = yield select(state => state.wallet);
    if (isUser !== currentIsUser) {
      yield put({ type: `${walletActions.SWITCH_ROLE}_SUCCESS` });
    }

    const networkInfo = yield call(loadNetwork);
    if (networkInfo == null) {
      return yield all([]);
    }

    // Add default accounts
    web3.eth.accounts.wallet.add(userPrivKey);
    web3.eth.accounts.wallet.add(trusteePrivKey);

    yield put({
      type: walletActions.INIT,
      tokenContract: networkInfo.tokenContract,
      isUser,
    });

    return yield put({
      type: networkActions.CHANGE_SUCCESS,
      id: networkInfo.networkId,
    });
  }

  function* handleChange(action) {
    const { provider } = action;
    web3.eth.setProvider(provider);
    const { isUser } = yield select(state => state.wallet);
    return yield call(handleInit, { isUser });
  }

  function* loadNetwork() {
    try {
      const id = yield call(web3.eth.net.getId);

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

      yield all([
        put({
          type: networkActions.SET_CONTRACTS,
          tokenContract,
          operationsContract,
        }),
        fork(
          getPastContractEvents,
          tokenContract,
          operationsContract,
          id,
        ),
      ]);

      return {
        tokenContract,
        operationsContract,
        networkId: id,
      };
    } catch (err) {
      yield all([
        put({
          type: networkActions.CHANGE_ERROR,
          // TODO translate
          error: 'Network unavailable',
        }),
      ]);
      return null;
    }
  }

  function* getNewEvents() {
    const {
      tokenContract,
      operationsContract,
      id: networkId,
    } = yield select(state => state.network);

    return yield call(
      getPastContractEvents,
      tokenContract,
      operationsContract,
      networkId,
    );
  }

  function* getPastContractEvents(tokenContract, operationsContract, networkId) {
    const transactionsTable = `transactions_${networkId}`;

    if (!db.hasTable(transactionsTable)) {
      db.createTable(transactionsTable, [
        'tx_hash',
        'from',
        'index',
        'date',
        'amount',
        'type',
        'status',
        'finalizeDate',
      ]);
    }

    const maxRange = 200;

    let opsPastEvents = [];
    let latestBlock = 0;
    let fromBlock = 0;
    try {
      latestBlock = yield call(web3.eth.getBlock, 'latest');
      fromBlock = (db.exists('network', { network_id: networkId }))
        ? (db.select('network', { network_id: networkId })[0]).block_number + 1
        : 0;
      const allCalls = yield all(
        (new Array(Math.ceil((latestBlock.number - fromBlock) / maxRange)))
          .fill(fromBlock)
          .map((initial, idx) => ({
            from: initial + idx * maxRange,
            to: Math.min(
              initial + (idx + 1) * maxRange - 1,
              latestBlock.number,
            ),
          }))
          .map(({ from, to }) => call(
            _retryCall,
            [
              operationsContract.getPastEvents.bind(operationsContract),
              'allEvents',
              { fromBlock: from, toBlock: to },
            ],
            500,
            3,
          )),
      );

      opsPastEvents = [].concat(...allCalls);
    } catch (e) {
      return yield all([
        put({
          type: `${transactionsActions.LOAD}_ERROR`,
          message: e.message,
        }),
        put({
          type: walletActions.CALCULATE_PENDING,
          isUser,
          networkId,
          tokenContract,
          operationsContract,
        }),
      ]);
    }

    opsPastEvents.forEach((e) => {
      switch (e.event) {
        case 'MintOperationRequested': {
          db.insert(transactionsTable, {
            tx_hash: e.transactionHash,
            from: e.returnValues.by,
            to: operationsContract.address,
            index: e.returnValues.index,
            date: parseInt(e.returnValues.requestTimestamp, 10) * 1000,
            amount: e.returnValues.value,
            type: txType.TOKENIZE,
            status: txStatus.PENDING_APPROVAL,
          });
          break;
        }
        case 'MintOperationApproved': {
          db.update(
            transactionsTable,
            { from: e.returnValues.by, index: e.returnValues.index },
            row => ({
              ...row,
              status: txStatus.PENDING_FINALIZE,
              finalizeDate: parseInt(e.returnValues.finalizeTimestamp, 10) * 1000,
            }),
          );
          break;
        }
        case 'MintOperationFinalized': {
          db.update(
            transactionsTable,
            { from: e.returnValues.by, index: e.returnValues.index },
            row => ({ ...row, status: txStatus.SUCCESS }),
          );
          break;
        }
        case 'MintOperationRevoked': {
          db.update(
            transactionsTable,
            { from: e.returnValues.by, index: e.returnValues.index },
            row => ({ ...row, status: txStatus.FAILURE }),
          );
          break;
        }
        case 'BurnOperationRequested': {
          db.insert(transactionsTable, {
            tx_hash: e.transactionHash,
            from: e.returnValues.by,
            to: operationsContract.address,
            index: e.returnValues.index,
            date: parseInt(e.returnValues.requestTimestamp, 10) * 1000,
            amount: e.returnValues.value,
            type: txType.WITHDRAWAL,
            status: txStatus.SUCCESS,
          });
          break;
        }
        default: {
          // Do nothing
        }
      }
    });

    if (fromBlock === 0) {
      db.insert(
        'network',
        { network_id: networkId, block_number: latestBlock.number },
      );
    } else {
      db.update(
        'network',
        { network_id: networkId },
        row => ({ ...row, block_number: latestBlock.number }),
      );
    }

    const walletState = yield select(state => state.wallet);
    const transactionsState = yield select(state => state.transactions);
    const { isUser, currentDefaultAccount } = walletState;

    return yield all([
      put({
        type: transactionsActions.LOAD,
        filterType: transactionsState.currentFilterType,
        filterStatus: transactionsState.currentFilterStatus,
        networkId,
        isUser,
        currentDefaultAccount,
        operationsContractAddress: operationsContract.address,
      }),
      put({
        type: walletActions.CALCULATE_PENDING,
        isUser,
        networkId,
        tokenContract,
        operationsContract,
      }),
    ]);
  }

  return function* watchNetwork() {
    yield all([
      takeLatest(networkActions.INIT, handleInit),
      takeLatest(networkActions.NEW_BLOCK, getNewEvents),
      takeLatest(networkActions.CHANGE_PROVIDER, handleChange),
    ]);
  };
};

export default network;
