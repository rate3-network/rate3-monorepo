import { walletActions } from '../actions/Wallet';
import { accountAddresses } from '../constants/addresses';
import { sgdrDecimalPlaces, sgdDecimalPlaces } from '../constants/defaults';

const initialState = {
  isUser: true,

  walletLoading: false,
  balancesLoading: false,

  currentDefaultAccount: accountAddresses.user,
  currentEthBalance: '0',
  currentTokenBalance: (0).toFixed(sgdrDecimalPlaces),
  currentBankBalance: (0).toFixed(sgdDecimalPlaces),

  currentPendingTokenization: (0).toFixed(sgdDecimalPlaces),
  currentPendingWithdrawal: (0).toFixed(sgdrDecimalPlaces),

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
    case walletActions.SWITCH_ROLE:
    case walletActions.INIT: {
      return {
        ...state,
        walletLoading: true,
        balancesLoading: true,
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
        currentTokenBalance: (0).toFixed(sgdrDecimalPlaces),
        currentBankBalance: (0).toFixed(sgdDecimalPlaces),
        currentPendingTokenization: (0).toFixed(sgdDecimalPlaces),
        currentPendingWithdrawal: (0).toFixed(sgdrDecimalPlaces),
      };
    }
    case walletActions.SET_ETH_BALANCE: {
      const { balance } = action;
      return {
        ...state,
        currentEthBalance: balance,
        walletLoading: false,
      };
    }
    case walletActions.SET_BALANCE: {
      const {
        tokenBalance,
        bankBalance,
        pendingTokenization,
        pendingWithdrawal,
      } = action;

      return {
        ...state,
        currentTokenBalance: tokenBalance,
        currentBankBalance: bankBalance,
        currentPendingTokenization: pendingTokenization,
        currentPendingWithdrawal: pendingWithdrawal,
        balancesLoading: false,
      };
    }
    default: {
      return state;
    }
  }
}
