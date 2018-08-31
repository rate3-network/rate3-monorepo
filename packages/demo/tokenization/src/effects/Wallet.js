import {
  all,
  put,
  call,
  select,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';
import { Decimal } from 'decimal.js-light';
import { walletActions } from '../actions/Wallet';
import { transactionsActions } from '../actions/Transactions';
import { txType, txStatus } from '../constants/enums';
import { userInitialAmount, sgdrDecimalPlaces, sgdDecimalPlaces } from '../constants/defaults';


const wallet = (db, web3) => {
  function* handleRoleSwitch(action) {
    const walletState = yield select(state => state.wallet);
    const {
      id: networkId,
      tokenContract,
      operationsContract,
    } = yield select(state => state.network);
    const { isUser, userDefaultAccount } = walletState;

    if (!operationsContract) {
      return yield put({
        type: `${walletActions.SWITCH_ROLE}_SUCCESS`,
      });
    }

    // Put this first so that UI will can eager load
    yield put({
      type: `${walletActions.SWITCH_ROLE}_SUCCESS`,
    });

    const getUserInformation = !isUser;
    const nextActions = [];

    if (tokenContract) {
      nextActions.push(yield call(initWallet, {
        type: walletActions.INIT,
        tokenContract,
        isUser: getUserInformation,
      }));
    }

    nextActions.push(put({
      type: transactionsActions.LOAD,
      filterType: null,
      filterStatus: null,
      networkId,
      isUser: getUserInformation,
      currentDefaultAccount: userDefaultAccount,
      operationsContractAddress: operationsContract.options.address,
    }));
    nextActions.push(put({
      type: walletActions.CALCULATE_PENDING,
      isUser: getUserInformation,
      networkId,
      tokenContract,
      operationsContract,
    }));

    return yield all(nextActions);
  }

  function* initWallet(action) {
    const {
      isUser,
    } = action;
    const walletState = yield select(state => state.wallet);
    const { userDefaultAccount, trusteeDefaultAccount } = walletState;

    const nextActions = [];

    if (isUser) {
      const ethBalance = yield call(web3.eth.getBalance, userDefaultAccount);
      nextActions.push(put({
        type: walletActions.SET_ETH_BALANCE,
        balance: web3.utils.fromWei(ethBalance),
      }));
    } else {
      const ethBalance = yield call(web3.eth.getBalance, trusteeDefaultAccount);
      nextActions.push(put({
        type: walletActions.SET_ETH_BALANCE,
        balance: web3.utils.fromWei(ethBalance),
      }));
    }

    yield all([
      ...nextActions,
    ]);

    return yield put({
      type: `${walletActions.INIT}_SUCCESS`,
    });
  }

  function* calculatePending(action) {
    const {
      isUser,
      tokenContract,
      operationsContract,
      networkId,
    } = action;
    const walletState = yield select(state => state.wallet);
    const { userDefaultAccount } = walletState;
    const transactionsTable = `transactions_${networkId}`;

    let tokenBalance;
    let bankBalance;
    let bankBalanceDecimal;
    let pendingTokenization;
    let pendingWithdrawal;

    if (isUser) {
      tokenBalance = new Decimal(yield call(
        tokenContract.methods.balanceOf(userDefaultAccount).call,
      )).toFixed(sgdrDecimalPlaces);
      pendingTokenization = db
        .select(transactionsTable, {
          from: userDefaultAccount,
          type: txType.TOKENIZE,
          status: value => (value !== txStatus.SUCCESS && value !== txStatus.FAILURE),
        })
        .reduce(
          (pending, txn) => pending.add(new Decimal(txn.amount)),
          new Decimal(0),
        )
        .toFixed(sgdDecimalPlaces);
      pendingWithdrawal = db
        .select(transactionsTable, {
          from: userDefaultAccount,
          type: txType.WITHDRAWAL,
          status: value => (value !== txStatus.SUCCESS && value !== txStatus.FAILURE),
        })
        .reduce(
          (pending, txn) => pending.add(new Decimal(txn.amount)),
          new Decimal(0),
        )
        .toFixed(sgdrDecimalPlaces);
      bankBalanceDecimal = (new Decimal(userInitialAmount))
        .sub(new Decimal(tokenBalance))
        .sub(new Decimal(pendingTokenization));
    } else {
      tokenBalance = new Decimal(yield call(
        tokenContract.methods.totalSupply().call,
      )).toFixed(sgdrDecimalPlaces);
      pendingTokenization = db
        .select(transactionsTable, {
          to: operationsContract.options.address,
          type: txType.TOKENIZE,
          status: value => (value !== txStatus.SUCCESS && value !== txStatus.FAILURE),
        })
        .reduce(
          (pending, txn) => pending.add(new Decimal(txn.amount)),
          new Decimal(0),
        )
        .toFixed(sgdDecimalPlaces);
      pendingWithdrawal = (new Decimal(0)).toFixed(sgdrDecimalPlaces);
      bankBalanceDecimal = (new Decimal(tokenBalance))
        .add(new Decimal(pendingTokenization));
    }

    if (bankBalanceDecimal.isNegative()) {
      bankBalance = new Decimal(0);
    } else {
      bankBalance = bankBalanceDecimal.toFixed(sgdDecimalPlaces);
    }

    return yield put({
      type: walletActions.SET_BALANCE,
      tokenBalance,
      bankBalance,
      pendingTokenization,
      pendingWithdrawal,
    });
  }

  return function* watchWallet() {
    yield all([
      takeEvery(walletActions.SWITCH_ROLE, handleRoleSwitch),
      takeLatest(walletActions.INIT, initWallet),
      takeLatest(walletActions.CALCULATE_PENDING, calculatePending),
    ]);
  };
};

export default wallet;
