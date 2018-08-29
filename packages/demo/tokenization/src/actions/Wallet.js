import { keyMirror } from '../utils';

export const walletActions = keyMirror(
  {
    INIT: null,

    SWITCH_ROLE: null,

    SET_ETH_BALANCE: null,
    SET_BALANCE: null,

    CALCULATE_PENDING: null,
  },
  'WALLET',
);

export const switchRole = () => ({
  type: walletActions.SWITCH_ROLE,
});
