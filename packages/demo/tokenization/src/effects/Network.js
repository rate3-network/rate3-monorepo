import {
  all,
  put,
  call,
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

    return yield put({
      type: walletActions.INIT,
      tokenContract: networkInfo.tokenContract,
      isUser,
    });
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

      yield put({
        type: networkActions.SET_CONTRACTS,
        tokenContract,
        operationsContract,
        networkId: id,
      });

      const accountsRaw = yield call(web3.eth.getAccounts);
      const accounts = [];
      for (const hash of accountsRaw) {
        const balanceWei = yield call(web3.eth.getBalance, hash);
        accounts.push({
          hash,
          balanceWei,
          balance: balanceWei,
        });
      }
      yield put({
        type: networkActions.CHANGE_SUCCESS,
        id,
        accounts,
      });

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

    return yield call(getPastContractEvents, {
      tokenContract,
      operationsContract,
      networkId,
    });
  }

  function* getPastContractEvents(action) {
    const { operationsContract, networkId } = action;

    const latestBlock = yield call(web3.eth.getBlock, 'latest');
    const fromBlock = (db.exists('network', { network_id: networkId }))
      ? (db.select('network', { network_id: networkId })[0]).block_number + 1
      : 0;

    const opsPastEventsCall = call(
      operationsContract.getPastEvents.bind(operationsContract),
      'allEvents',
      {
        fromBlock, toBlock: latestBlock.number,
      },
    );
    const opsPastEvents = yield opsPastEventsCall;

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
        networkId,
      }),
    ]);
  }

  return function* watchNetwork() {
    yield all([
      takeLatest(networkActions.INIT, handleInit),
      takeLatest(networkActions.SET_CONTRACTS, getPastContractEvents),
      takeLatest(networkActions.NEW_BLOCK, getNewEvents),
    ]);
  };
};

export default network;
