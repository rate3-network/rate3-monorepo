import { createAction, keyMirror } from '../utils/general';
import { IE2SRequest, IS2ERequest } from '../reducers/issuer';

export const networkActions = keyMirror(
  {
    INIT_USER: null,
    INIT_ISSUER: null,
    SET_USER_ETH_BALANCE: null,
    SET_ISSUER_ETH_BALANCE: null,
    SET_ISSUER_STELLAR_BALANCE: null,
    SET_R3_INSTANCE: null,
    SET_USER_STELLAR_BALANCE: null,
    ADD_TO_MAP: null,
    SELECT_TX: null,
  },
  'NETWORK'
);
export const initUser =
  createAction<void, void>(networkActions.INIT_USER);
export const initIssuer =
  createAction<void, void>(networkActions.INIT_ISSUER);
export const setUserEthBalance =
  createAction<void, void>(networkActions.SET_USER_ETH_BALANCE);
export const setIssuerEthBalance =
  createAction<void, void>(networkActions.SET_ISSUER_ETH_BALANCE);
export const setIssuerStellarBalance =
  createAction<void, void>(networkActions.SET_ISSUER_STELLAR_BALANCE);
export const setR3Instance =
  createAction<void, void>(networkActions.SET_R3_INSTANCE);
export const setUserStellarBalance =
  createAction<void, void>(networkActions.SET_USER_STELLAR_BALANCE);
export const addToMap =
  createAction<IE2SRequest | IS2ERequest, void>(networkActions.ADD_TO_MAP);
export const selectTx =
  createAction<string, void>(networkActions.SELECT_TX);
