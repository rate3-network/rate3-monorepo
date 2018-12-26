import { createAction, keyMirror } from '../utils/general';

export const userActions = keyMirror(
  {
    REQUEST_ETH_TO_STELLAR: null,
    REQUEST_STELLAR_TO_ETH: null,
  },
  'USER'
);
export const requestEthToStellar =
  createAction<string, void>(userActions.REQUEST_ETH_TO_STELLAR);
export const requestStellarToEth =
  createAction<string, void>(userActions.REQUEST_STELLAR_TO_ETH);
