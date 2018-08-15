import { walletActions } from '../actions/Wallet';


const initialState = {
  isUser: true,
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
        isUser: !state.isUser,
      };
    }
    default: {
      return state;
    }
  }
}
