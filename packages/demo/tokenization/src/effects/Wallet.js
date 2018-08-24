import {
  all,
  put,
  call,
  select,
  takeEvery,
} from 'redux-saga/effects';
import { walletActions } from '../actions/Wallet';
import { transactionsActions } from '../actions/Transactions';
import { txStatus } from '../constants/enums';


const wallet = (db, web3) => {
  function* handleActions(action) {
    const { type } = action;
    switch (type) {
      case walletActions.INIT:
      case walletActions.SWITCH_ROLE: {
        const walletState = yield select(state => state.wallet);
        const { tokenContract } = yield select(state => state.network);
        const { isUser, userDefaultAccount, trusteeDefaultAccount } = walletState;

        // Use `isUser` only for init, switch role should use the opposite case
        const getUserInformation = (isUser && type === walletActions.INIT)
          || (!isUser && type === walletActions.SWITCH_ROLE);

        const nextActions = [];

        if (getUserInformation) {
          if (tokenContract) {
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
              balance: web3.utils.fromWei(tokenBalance),
            }));
          }

          nextActions.push(put({
            type: transactionsActions.SET_CURRENT_TRANSACTIONS,
            transactions: db.select('transactions', {
              from: userDefaultAccount,
            }),
            filterType: null,
            filterStatus: null,
          }));
        } else {
          if (tokenContract) {
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
              balance: web3.utils.fromWei(tokenBalance),
            }));
          }

          nextActions.push(put({
            type: transactionsActions.SET_CURRENT_TRANSACTIONS,
            transactions: db.select('transactions', {
              to: trusteeDefaultAccount,
            }),
            filterType: null,
            filterStatus: null,
          }));
          nextActions.push(put({
            type: transactionsActions.SET_PENDING_APPROVAL_TRANSACTIONS,
            transactions: db.select('transactions', {
              to: trusteeDefaultAccount,
              status: txStatus.PENDING_APPROVAL,
            }),
          }));
        }

        return yield all([
          ...nextActions,
          put({
            type: `${type}_SUCCESS`,
          }),
        ]);
      }
      default:
        return yield all([]);
    }
  }

  return function* watchWallet() {
    yield all([
      takeEvery(
        action => action.type === walletActions.SWITCH_ROLE
         || action.type === walletActions.INIT,
        handleActions,
      ),
    ]);
  };
};

export default wallet;
