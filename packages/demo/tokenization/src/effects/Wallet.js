import {
  all,
  put,
  call,
  select,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';
import { walletActions } from '../actions/Wallet';
import { transactionsActions } from '../actions/Transactions';
import { txType, txStatus } from '../constants/enums';
import { Decimal } from 'decimal.js-light';


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
      operationsContractAddress: operationsContract.address,
    }));

    return yield all(nextActions);
  }

  function* initWallet(action) {
    const {
      tokenContract,
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

      const tokenBalance = yield call(
        tokenContract.methods.balanceOf(userDefaultAccount).call,
      );
      nextActions.push(put({
        type: walletActions.SET_TOKEN_BALANCE,
        balance: tokenBalance,
      }));
    } else {
      const ethBalance = yield call(web3.eth.getBalance, trusteeDefaultAccount);
      nextActions.push(put({
        type: walletActions.SET_ETH_BALANCE,
        balance: web3.utils.fromWei(ethBalance),
      }));

      const tokenBalance = yield call(
        tokenContract.methods.totalSupply().call,
      );
      nextActions.push(put({
        type: walletActions.SET_TOKEN_BALANCE,
        balance: tokenBalance,
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
    const { networkId } = action;
    const walletState = yield select(state => state.wallet);
    const { userDefaultAccount } = walletState;
    const transactionsTable = `transactions_${networkId}`;

    const pendingTokenization = db
      .select(transactionsTable, {
        from: userDefaultAccount,
        type: txType.TOKENIZE,
        status: value => (value !== txStatus.SUCCESS && value !== txStatus.FAILURE),
      })
      .reduce(
        (pending, txn) => pending.add(new Decimal(txn.amount)),
        new Decimal(0),
      )
      .toString();
    const pendingWithdrawal = db
      .select(transactionsTable, {
        from: userDefaultAccount,
        type: txType.WITHDRAWAL,
        status: value => (value !== txStatus.SUCCESS && value !== txStatus.FAILURE),
      })
      .reduce(
        (pending, txn) => pending.add(new Decimal(txn.amount)),
        new Decimal(0),
      )
      .toString();

    return yield all([
      put({
        type: walletActions.SET_PENDING_TOKENIZE_BALANCE,
        balance: pendingTokenization,
      }),
      put({
        type: walletActions.SET_PENDING_WITHDRAW_BALANCE,
        balance: pendingWithdrawal,
      }),
    ]);
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
