import { keyMirror } from '../utils';

export const walletActions = keyMirror(
  {
    INIT: null,

    SWITCH_ROLE: null,

    SET_ETH_BALANCE: null,
    SET_TOKEN_BALANCE: null,

    CALCULATE_PENDING: null,
    SET_PENDING_TOKENIZE_BALANCE: null,
    SET_PENDING_WITHDRAW_BALANCE: null,
  },
  'WALLET',
);

export const switchRole = () => ({
  type: walletActions.SWITCH_ROLE,
});
