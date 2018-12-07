import { networkActions } from '../actions/network';
import * as W3 from '../web3Exported';
import * as Contract from 'web3/eth/contract';
const Web3 = require('web3');
import contractJson from '../contract.json';
import { USER_ETH_ADDR, ISSUER_ETH_ADDR } from '../constants/defaults';
import { IAction } from 'src/utils/general';

export interface IStoreState {
  contract: Contract.default | null;
  web3Obj: W3.default | null;
  userEthBalance: string;
  issuerEthBalance: string;
}

export const initialState = {
  contract: null,
  web3Obj: null,
  userEthBalance: 'loading...',
  issuerEthBalance: 'loading...',
  // web3Added: null,
};
const wsProvider = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws');

export function network(state: IStoreState = initialState, action: IAction):
IStoreState {
  switch (action.type) {
    case networkActions.INIT_USER:
      const web3User = new Web3(wsProvider);
      web3User.eth.accounts.wallet.add(USER_ETH_ADDR);
      (window as any).web3 = web3User;
      return { ...state, web3Obj: web3User };

    case networkActions.INIT_ISSUER:
      const web3Issuer = new Web3(wsProvider);
      web3Issuer.eth.accounts.wallet.add(ISSUER_ETH_ADDR);
      (window as any).web3 = web3Issuer;
      return { ...state, web3Obj: web3Issuer };

    case networkActions.SET_USER_ETH_BALANCE:
      return { ...state, userEthBalance: action.payload.balance };

    case networkActions.SET_ISSUER_ETH_BALANCE:
      return { ...state, issuerEthBalance: action.payload.balance };
  }
  return state;
}
