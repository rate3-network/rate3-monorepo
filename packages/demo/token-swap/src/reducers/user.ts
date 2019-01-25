// tslint:disable:import-name
import { userActions } from '../actions/user';
import { TransactionReceipt } from 'web3/types';
const Web3 = require('web3');
import { USER_ETH_PRIV, ISSUER_ETH_PRIV } from '../constants/defaults';
import { IAction } from '../utils/general';
import { ROLES } from '../constants/general';
// import * as Stellar from 'stellar-sdk';
import r3Stellar from '../r3-stellar-js/r3-stellar';

export interface IStoreState {
  e2sTx: null | TransactionReceipt;
  s2eTx: null | TransactionReceipt;
}

export const initialState = {
  e2sTx: null,
  s2eTx: null,
};

export function user(state: IStoreState = initialState, action: IAction):
IStoreState {
  switch (action.type) {
    case userActions.REQUEST_ETH_TO_STELLAR:
      return state;
    case userActions.REQUEST_STELLAR_TO_ETH:
      return state;
  }
  return state;
}
