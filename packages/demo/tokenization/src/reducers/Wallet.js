import { walletActions } from '../actions/Wallet';
import { accountAddresses } from '../constants/addresses';

const initialAmount = '10000';

const initialState = {
  isUser: true,
  switchRoleLoading: false,

  currentDefaultAccount: accountAddresses.user,
  currentEthBalance: '0',
  currentTokenBalance: '0',
  currentBankBalance: '0',

  currentPendingTokenBalance: '0',
  currentPendingBankBalance: '0',

  userDefaultAccount: accountAddresses.user,
  trusteeDefaultAccount: accountAddresses.trustee,

  userAccounts: [
    accountAddresses.user,
  ],
  trusteeAccounts: [
    accountAddresses.trustee,
  ],
};

/**
 * Reducer for wallet state, which consists of:
 * - The current role
 *
 * @param {Object} [state=initialState] Previous state
 * @param {Object} [action={}] Current action
 * @returns {Object} Next state
 */
export default function (state = initialState, action = {}) {
  const { type } = action;
  switch (type) {
    case walletActions.SWITCH_ROLE: {
      return {
        ...state,
        switchRoleLoading: true,
      };
    }
    case `${walletActions.SWITCH_ROLE}_SUCCESS`: {
      return {
        ...state,
        isUser: !state.isUser,
        currentDefaultAccount: state.isUser
          ? state.trusteeDefaultAccount
          : state.userDefaultAccount,
        currentEthBalance: '0',
        currentTokenBalance: '0',
        currentBankBalance: '0',
      };
    }
    case walletActions.SET_ETH_BALANCE: {
      const { balance } = action;
      return {
        ...state,
        currentEthBalance: balance,
      };
    }
    case walletActions.SET_TOKEN_BALANCE: {
      const { balance } = action;
      const { BN } = window.web3.utils;
      return {
        ...state,
        currentTokenBalance: balance,
        currentBankBalance: (new BN(initialAmount))
          .sub(new BN(balance)).toString(10),
      };
    }
    case walletActions.SET_PENDING_TOKENIZE_BALANCE: {
      const { balance } = action;
      return {
        ...state,
        currentPendingTokenBalance: balance,
      };
    }
    case walletActions.SET_PENDING_WITHDRAW_BALANCE: {
      const { balance } = action;
      return {
        ...state,
        currentPendingBankBalance: balance,
      };
    }
    case `${walletActions.INIT}_SUCCESS`: {
      return {
        ...state,
        switchRoleLoading: false,
      };
    }
    default: {
      return state;
    }
  }
}
