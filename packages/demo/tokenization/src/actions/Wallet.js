import { keyMirror } from '../utils';

export const walletActions = keyMirror(
  {
    SWITCH_ROLE: null,
  },
  'WALLET',
);

export const switchRole = () => ({
  type: walletActions.SWITCH_ROLE,
});
