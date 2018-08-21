import { walletActions } from '../actions/Wallet';


const initialState = {
  isUser: true,

  currentDefaultAccount: '0x687422eea2cb73b5d3e242ba5456b782919afc85',

  userDefaultAccount: '0x687422eea2cb73b5d3e242ba5456b782919afc85',
  trusteeDefaultAccount: '0x590F39c5dadD62a3e4Ad6E323632cA2B3Ed371ab',

  userAccounts: [
    '0x687422eea2cb73b5d3e242ba5456b782919afc85',
  ],
  trusteeAccounts: [
    '0x590F39c5dadD62a3e4Ad6E323632cA2B3Ed371ab',
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
    case `${walletActions.SWITCH_ROLE}_SUCCESS`: {
      return {
        ...state,
        isUser: !state.isUser,
        currentDefaultAccount: state.isUser
          ? state.trusteeDefaultAccount
          : state.userDefaultAccount,
      };
    }
    default: {
      return state;
    }
  }
}
