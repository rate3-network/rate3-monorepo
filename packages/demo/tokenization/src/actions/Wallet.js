import { keyMirror } from '../utils';

export const walletActions = keyMirror(
  {
    INIT: null,

    SWITCH_ROLE: null,
  },
  'WALLET',
);

export const switchRole = () => ({
  type: walletActions.SWITCH_ROLE,
});
