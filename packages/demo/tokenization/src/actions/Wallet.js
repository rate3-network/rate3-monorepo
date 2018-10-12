import { keyMirror } from '../utils';

export const walletActions = keyMirror(
  {
    INIT: null,

    SWITCH_ROLE: null,

    SET_ETH_BALANCE: null,
    SET_BALANCE: null,

    CALCULATE_PENDING: null,

    SWITCH_SETTINGS_TAB: null,
  },
  'WALLET',
);

export const switchRole = () => ({
  type: walletActions.SWITCH_ROLE,
});

export const switchSettingsTab = tabIndex => ({
  type: walletActions.SWITCH_SETTINGS_TAB,
  tabIndex,
});
