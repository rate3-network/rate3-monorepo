import { genActionTypes } from '../utils';

export const networkActions = genActionTypes(
  {
    INIT: null,

    CHANGE: null,
    CHANGE_SUCCESS: null,
    CHANGE_ERROR: null,

    UPDATE_BALANCE: null,
    UPDATE_BALANCE_SUCCESS: null,
    UPDATE_BALANCE_ERROR: null,

    FETCH_ACCOUNTS: null,
    FETCH_ACCOUNTS_SUCCESS: null,

    FETCH_LOCAL_WALLET: null,
    FETCH_LOCAL_WALLET_SUCCESS: null,

    SELECT_ACCOUNT: null,
    SET_PROVIDER: null,
    SET_IPFS: null,

    SEND_FROM_NODE: null,
    SEND_FROM_NODE_SUCCESS: null,
    SEND_FROM_NODE_ERROR: null,

    SEND_FROM_ACCOUNT: null,
    SEND_FROM_ACCOUNT_SUCCESS: null,
    SEND_FROM_ACCOUNT_ERROR: null,
  },
  'NETWORK',
);

export const init = () => ({
  type: networkActions.INIT,
});
