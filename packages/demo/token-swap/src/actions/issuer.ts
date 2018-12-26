import { createAction, keyMirror } from '../utils/general';

export const issuerActions = keyMirror(
  {
    APPROVE_ETH_TO_STELLAR: null,
  },
  'NETWORK'
);
export const approveEthToStellar =
  createAction<void, void>(issuerActions.APPROVE_ETH_TO_STELLAR);
