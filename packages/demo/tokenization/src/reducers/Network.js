
import { networkActions } from '../actions/Network';
import Providers from '../constants/Providers';

/**
 * Reducer for network state, which consists of:
 * - The current network type
 *
 * @param {Object} [web3] web3 instance
 * @param {Object} [browserProvider] existing web3's provider
 * @returns {Object} Next state
 */
export default (web3, browserProvider) => {
  const initialState = {
    id: null,

    accounts: [],
    account: null,
    status: 'disconnected',

    browserProvider,
    providers: Providers,
    provider: web3.currentProvider,

    tokenContract: null,
    operationsContract: null,
  };

  return function reducer(state = initialState, action = {}) {
    const { type } = action;
    switch (type) {
      case networkActions.CHANGE_SUCCESS: {
        const { id, accounts } = action;
        return {
          ...state,
          status: 'connected',
          id,
          accounts,
          account: accounts[0],
        };
      }
      case networkActions.SET_CONTRACTS: {
        const { tokenContract, operationsContract } = action;
        return {
          ...state,
          tokenContract,
          operationsContract,
        };
      }
      default: {
        return state;
      }
    }
  };
};
