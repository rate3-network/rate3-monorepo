import { keyMirror } from '../utils';

export const networkActions = keyMirror(
  {
    INIT: null,

    SET_CONTRACTS: null,

    CHANGE: null,
    CHANGE_SUCCESS: null,
    CHANGE_ERROR: null,

    CHANGE_PROVIDER: null,

    NEW_BLOCK: null,
  },
  'NETWORK',
);

export const init = isUser => ({
  type: networkActions.INIT,
  isUser,
});

export const change = networkId => ({
  type: networkActions.CHANGE_PROVIDER,
  networkId,
});
