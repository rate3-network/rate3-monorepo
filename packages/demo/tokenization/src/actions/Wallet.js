import { genActionTypes } from '../utils';

export const walletActions = genActionTypes(
  {
    SWITCH_ROLE: null,
  },
  'WALLET',
);

export const switchRole = () => ({
  type: walletActions.SWITCH_ROLE,
});
