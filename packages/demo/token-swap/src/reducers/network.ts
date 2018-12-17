import { networkActions } from '../actions/network';
import * as W3 from '../web3Exported';
import * as Contract from 'web3/eth/contract';
const Web3 = require('web3');
import contractJson from '../contract.json';
import { USER_ETH_ADDR, ISSUER_ETH_ADDR } from '../constants/defaults';
import { IAction } from '../utils/general';
import { ROLES } from '../constants/general';
// import * as Stellar from 'stellar-sdk';
import r3Stellar from '../r3-stellar-js/r3-stellar';

export interface IStoreState {
  r3Stellar: typeof r3Stellar;
  r3: typeof r3Stellar | null;
  role: ROLES | null;
  contract: Contract.default | null;
  web3Obj: W3.default | null;
  userEthBalance: string;
  issuerEthBalance: string;
  userStellarBalance: string;
}

export const initialState = {
  r3Stellar,
  r3: null,
  role: null,
  contract: null,
  web3Obj: null,
  userEthBalance: 'loading...',
  issuerEthBalance: 'loading...',
  userStellarBalance: 'loading...',
};
const wsProvider = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws');

export function network(state: IStoreState = initialState, action: IAction):
IStoreState {
  switch (action.type) {
    case networkActions.INIT_USER:
      const web3User = new Web3(wsProvider);
      web3User.eth.accounts.wallet.add(USER_ETH_ADDR);
      (window as any).web3 = web3User;
      console.log(state.r3Stellar);
      return { ...state, role: ROLES.USER, web3Obj: web3User };

    case networkActions.INIT_ISSUER:
      const web3Issuer = new Web3(wsProvider);
      web3Issuer.eth.accounts.wallet.add(ISSUER_ETH_ADDR);
      (window as any).web3 = web3Issuer;
      return { ...state, role: ROLES.ISSUER, web3Obj: web3Issuer };

    case networkActions.SET_USER_ETH_BALANCE:
      return { ...state, userEthBalance: action.payload.balance };

    case networkActions.SET_ISSUER_ETH_BALANCE:
      return { ...state, issuerEthBalance: action.payload.balance };

    case networkActions.SET_R3_INSTANCE:
      return { ...state, r3: action.payload.r3 };

    case networkActions.SET_USER_STELLAR_BALANCE:
      return { ...state, userStellarBalance: action.payload.balance };
  }
  return state;
}
