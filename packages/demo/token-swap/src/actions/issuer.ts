import { createAction, keyMirror } from '../utils/general';
import { IE2SRequest, IS2ERequest } from '../reducers/issuer';

export const issuerActions = keyMirror(
  {
    FETCH_ETH_TO_STELLAR: null,
    FETCH_STELLAR_TO_ETH: null,
    APPROVE: null,
    // APPROVE_ETH_TO_STELLAR: null,
    // APPROVE_STELLAR_TO_ETH: null,
    SET_E2S_APPROVAL_LIST: null,
    SET_S2E_APPROVAL_LIST: null,
  },
  'ISSUER'
);
export const fetchEthToStellar =
  createAction<void, void>(issuerActions.FETCH_ETH_TO_STELLAR);
export const fetchStellarToEth =
  createAction<void, void>(issuerActions.FETCH_STELLAR_TO_ETH);
// export const approveEthToStellar =
//   createAction<void, void>(issuerActions.APPROVE_ETH_TO_STELLAR);
export const approve =
  createAction<IE2SRequest | IS2ERequest, void>(issuerActions.APPROVE);
export const setE2SApprovalList =
    createAction<void, void>(issuerActions.SET_E2S_APPROVAL_LIST);
export const setS2EApprovalList =
  createAction<void, void>(issuerActions.SET_S2E_APPROVAL_LIST);
