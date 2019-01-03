// tslint:disable:import-name
import { issuerActions } from '../actions/issuer';
import { TransactionReceipt } from 'web3/types';
const Web3 = require('web3');
import { USER_ETH_PRIV, ISSUER_ETH_PRIV } from '../constants/defaults';
import { IAction } from '../utils/general';
import { ROLES } from '../constants/general';
// import * as Stellar from 'stellar-sdk';
import r3Stellar from '../r3-stellar-js/r3-stellar';

export interface IE2SRequest {
  hash: string;
  amount: string;
  ethAddress: string;
  stellarAddress: string;
  type: 'E2S';
  approved: boolean;
  indexID: string;
  aceeptHash: string;
  acceptedBy: string;
  acceptTimestamp: string;
}
export interface IS2ERequest {
  hash: string;
  amount: string;
  ethAddress: string;
  stellarAddress: string;
  type: 'S2E';
  approved: boolean;
}
export interface IStoreState {
  e2sApproveTx: null | TransactionReceipt;
  s2eApproveTx: null | TransactionReceipt;
  e2sApprovalList: null | IE2SRequest[];
  s2eApprovalList: null | IS2ERequest[];
}

export const initialState = {
  e2sApproveTx: null,
  s2eApproveTx: null,
  e2sApprovalList: null,
  s2eApprovalList: null,
};

export function issuer(state: IStoreState = initialState, action: IAction):
IStoreState {
  switch (action.type) {
    case issuerActions.APPROVE_ETH_TO_STELLAR:
      return state;
    case issuerActions.APPROVE_STELLAR_TO_ETH:
      console.log('rer');
      return state;
    case issuerActions.SET_E2S_APPROVAL_LIST:
      return { ...state, e2sApprovalList: action.payload };
    case issuerActions.SET_S2E_APPROVAL_LIST:
      return { ...state, s2eApprovalList: action.payload };
  }
  return state;
}
