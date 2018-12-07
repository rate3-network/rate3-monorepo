import { createAction, keyMirror } from '../utils/general';

export const networkActions = keyMirror(
  {
    INIT_USER: null,
    INIT_ISSUER: null,
    SET_USER_ETH_BALANCE: null,
    SET_ISSUER_ETH_BALANCE: null,
  },
  'NETWORK'
);
export const initUser = createAction<void, void>(networkActions.INIT_USER);
export const initIssuer = createAction<void, void>(networkActions.INIT_ISSUER);
export const setUserEthBalance = createAction<void, void>(networkActions.SET_USER_ETH_BALANCE);
export const setIssuerEthBalance = createAction<void, void>(networkActions.SET_ISSUER_ETH_BALANCE);
