import Web3 from 'web3';
import { networkActions } from '../actions/Network';
import Providers from '../constants/Providers';

let provider = 'https://rinkeby.infura.io';
let browserProvider = false;

if (typeof window !== 'undefined') {
  provider = window.sessionStorage.provider || provider;
  if (window.web3) {
    // Stores the existing provider (i.e. metamask) to allow switching.
    browserProvider = window.web3.currentProvider;
  }
  window.web3 = new Web3(provider);
}

const initialState = {
  id: null,

  accounts: [],
  account: null,
  status: 'disconnected',

  browserProvider,
  providers: Providers,
  provider,
};

/**
 * Reducer for network state, which consists of:
 * - The current network type
 *
 * @param {Object} [state=initialState] Previous state
 * @param {Object} [action={}] Current action
 * @returns {Object} Next state
 */
export default function (state = initialState, action = {}) {
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
    default: {
      return state;
    }
  }
}
