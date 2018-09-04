import {
  all,
  put,
  call,
  spawn,
  select,
  takeLatest,
} from 'redux-saga/effects';

import { networkActions } from '../actions/Network';
import { transactionsActions } from '../actions/Transactions';
import { tokenizeActions } from '../actions/Tokenize';
import { withdrawActions } from '../actions/Withdraw';
import { approveActions } from '../actions/Approve';
import { finalizeActions } from '../actions/Finalize';
import { walletActions } from '../actions/Wallet';
import { contractAddresses } from '../constants/addresses';
import tokenContractAbi from '../contracts/token';
import operationsContractAbi from '../contracts/operations';
import { txType, txStatus } from '../constants/enums';
import { userPrivKey, trusteePrivKey } from '../constants/defaults';
import { networkId as networkIdKey } from '../constants/storageKeys';

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
  let currentFetchingNetwork = null;
  let currentFetchingBlock = null;

  function* autoFetchBlocks(networkId) {
    if (networkId !== currentFetchingNetwork) {
      return;
    }

    if (currentFetchingBlock == null) {
      const latestBlock = yield call(web3.eth.getBlock, 'latest');
      const latestBlockNumber = latestBlock.number;
      const currentBlockNumber = (db.exists('network', { network_id: networkId }))
        ? (db.select('network', { network_id: networkId })[0]).block_number
        : 0;
      if (latestBlockNumber > currentBlockNumber) {
        const {
          tokenContract,
          operationsContract,
        } = yield select(state => state.network);
        yield call(
          getPastContractEvents,
          tokenContract,
          operationsContract,
          networkId,
          latestBlockNumber,
        );
      }
    }
    yield call(delay, 5000);
    yield spawn(autoFetchBlocks, networkId);
  }

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
    const { networkId } = action;
    const networkData = Object.prototype.hasOwnProperty.call(contractAddresses, networkId)
      ? contractAddresses[networkId]
      : contractAddresses.local;
    sessionStorage.setItem(networkIdKey, networkData.id || -1);
    web3.eth.setProvider(networkData.endpoint);

    // Reset all current processes
    yield all([
      put({ type: tokenizeActions.RESET }),
      put({ type: withdrawActions.RESET }),
      put({ type: approveActions.RESET }),
      put({ type: finalizeActions.RESET }),
      put({ type: transactionsActions.RESET_PAGES_AND_FILTER }),
    ]);

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
        spawn(
          getPastContractEvents,
          tokenContract,
          operationsContract,
          id,
          null,
        ),
      ]);

      currentFetchingNetwork = id;
      yield spawn(autoFetchBlocks, id);

      return {
        tokenContract,
        operationsContract,
        networkId: id,
      };
    } catch (err) {
      yield all([
        put({
          type: networkActions.CHANGE_ERROR,
          error: err.message,
        }),
      ]);
      return null;
    }
  }

  function* getNewEvents(action) {
    const { toBlock } = action;
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
      toBlock,
    );
  }

  function* getPastContractEvents(tokenContract, operationsContract, networkId, toBlockNumber) {
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
    let toBlock = 0;
    let fromBlock = 0;
    try {
      if (toBlockNumber == null) {
        const latestBlock = yield call(web3.eth.getBlock, 'latest');
        toBlock = latestBlock.number;
      } else {
        toBlock = toBlockNumber;
      }
      // wait for current fetching to finish
      while (currentFetchingBlock != null) {
        if (currentFetchingBlock >= toBlock) {
          return yield all([]);
        }
        yield call(delay, 500);
      }
      currentFetchingBlock = toBlock;

      fromBlock = (db.exists('network', { network_id: networkId }))
        ? (db.select('network', { network_id: networkId })[0]).block_number
        : 0;
      const allCalls = yield all(
        (new Array(Math.ceil((toBlock - fromBlock) / maxRange)))
          .fill(fromBlock)
          .map((initial, idx) => ({
            from: initial + idx * maxRange,
            to: Math.min(
              initial + (idx + 1) * maxRange - 1,
              toBlock,
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
      const { isUser } = yield select(state => state.wallet);
      return yield all([
        put({
          type: `${transactionsActions.LOAD}_ERROR`,
          error: e.message,
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

    for (const e of opsPastEvents) {
      switch (e.event) {
        case 'MintOperationRequested': {
          if (!db.exists(transactionsTable, { tx_hash: e.transactionHash })) {
            db.insert(transactionsTable, {
              tx_hash: e.transactionHash,
              from: e.returnValues.by,
              to: operationsContract.options.address,
              index: e.returnValues.index,
              date: parseInt(e.returnValues.requestTimestamp, 10) * 1000,
              amount: e.returnValues.value,
              type: txType.TOKENIZE,
              status: txStatus.PENDING_APPROVAL,
            });
          }
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
          const txns = db.select(
            transactionsTable,
            { from: e.returnValues.by, index: e.returnValues.index },
          );
          if (txns.length === 1) {
            yield all([
              put({
                type: `${approveActions.SUBMIT_APPROVE_REQUEST}_FINALIZATION`,
                txHash: txns[0].tx_hash,
              }),
              put({
                type: `${tokenizeActions.SUBMIT_TOKENIZE_REQUEST}_APPROVAL`,
                txHash: txns[0].tx_hash,
              }),
            ]);
          }
          break;
        }
        case 'MintOperationRevoked': {
          db.update(
            transactionsTable,
            { from: e.returnValues.by, index: e.returnValues.index },
            row => ({ ...row, status: txStatus.FAILURE }),
          );
          const txns = db.select(
            transactionsTable,
            { from: e.returnValues.by, index: e.returnValues.index },
          );
          if (txns.length === 1) {
            yield put({
              type: `${approveActions.SUBMIT_APPROVE_REQUEST}_REVOCATION`,
              txHash: txns[0].tx_hash,
            });
          }
          break;
        }
        case 'BurnOperationRequested': {
          if (!db.exists(transactionsTable, { tx_hash: e.transactionHash })) {
            db.insert(transactionsTable, {
              tx_hash: e.transactionHash,
              from: e.returnValues.by,
              to: operationsContract.options.address,
              index: e.returnValues.index,
              date: parseInt(e.returnValues.requestTimestamp, 10) * 1000,
              amount: e.returnValues.value,
              type: txType.WITHDRAWAL,
              status: txStatus.SUCCESS,
            });
          }
          break;
        }
        default: {
          // Do nothing
        }
      }
    }

    if (fromBlock === 0) {
      db.insert(
        'network',
        { network_id: networkId, block_number: toBlock },
      );
    } else {
      db.update(
        'network',
        { network_id: networkId },
        row => ({ ...row, block_number: toBlock }),
      );
    }

    currentFetchingBlock = null;

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
        operationsContractAddress: operationsContract.options.address,
        resetPage: false,
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
