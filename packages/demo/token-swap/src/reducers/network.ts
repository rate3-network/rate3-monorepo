// tslint:disable:import-name
import { networkActions } from '../actions/network';
import * as W3 from '../web3Exported';
import * as Contract from 'web3/eth/contract';
const Web3 = require('web3');
const ConversionReceiverAbi = require('../constants/ConversionReceiverJson.json').abi;
const Erc20Abi = require('../constants/ERC20.json').abi;
import { USER_ETH_PRIV, ISSUER_ETH_PRIV } from '../constants/defaults';
import { IAction } from '../utils/general';
import { ROLES } from '../constants/general';
// import * as Stellar from 'stellar-sdk';
import r3Stellar from '../r3-stellar-js/r3-stellar';

export interface IStoreState {
  r3Stellar: typeof r3Stellar;
  r3: typeof r3Stellar | null;
  role: ROLES | null;
  contract: Contract.default | null;
  tokenContract: Contract.default | null;
  web3Obj: W3.default | null;
  userEthBalance: string;
  issuerEthBalance: string;
  userStellarBalance: string;
  userStellarSgdrBalance: string;
  issuerStellarBalance: string;
}

export const initialState = {
  r3Stellar,
  r3: null,
  role: null,
  contract: null,
  tokenContract: null,
  web3Obj: null,
  userEthBalance: 'loading...',
  issuerEthBalance: 'loading...',
  userStellarBalance: 'loading...',
  userStellarSgdrBalance: 'loading...',
  issuerStellarBalance: 'loading...',
};
// const wsProvider = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws');
const wsProvider = new Web3.providers.WebsocketProvider('ws://localhost:8545');

export function network(state: IStoreState = initialState, action: IAction):
IStoreState {
  switch (action.type) {
    case networkActions.INIT_USER:
      const web3User = new Web3(wsProvider);
      web3User.eth.accounts.wallet.add(USER_ETH_PRIV);
      (window as any).web3 = web3User;
      const contractUser  = new web3User.eth.Contract(
        ConversionReceiverAbi,
        '0x2b180f99b1f78fab7f796bcabbadca24ea25435b'
      );
      const tokenContractUser  = new web3User.eth.Contract(
        Erc20Abi,
        '0x80d1c9153b037e7a68406d75cbc40f40f7bf7aa2'
      );
      (window as any).ConversionReceiver = contractUser;
      (window as any).tokenContract = tokenContractUser;
      return { ...state, role: ROLES.USER, contract: contractUser,
        tokenContract: tokenContractUser, web3Obj: web3User };

    case networkActions.INIT_ISSUER:
      const web3Issuer = new Web3(wsProvider);
      web3Issuer.eth.accounts.wallet.add(ISSUER_ETH_PRIV);
      (window as any).web3 = web3Issuer;
      const contract  = new web3Issuer.eth.Contract(
        ConversionReceiverAbi,
        '0x2b180f99b1f78fab7f796bcabbadca24ea25435b'
      );
      const tokenContract  = new web3Issuer.eth.Contract(
        Erc20Abi,
        '0x80d1c9153b037e7a68406d75cbc40f40f7bf7aa2'
      );
      (window as any).ConversionReceiver = contract;
      (window as any).tokenContract = tokenContract;
      return {
        ...state,
        contract,
        tokenContract,
        role: ROLES.ISSUER,
        web3Obj: web3Issuer,
      };

    case networkActions.SET_USER_ETH_BALANCE:
      return { ...state, userEthBalance: action.payload.balance };

    case networkActions.SET_ISSUER_ETH_BALANCE:
      return { ...state, issuerEthBalance: action.payload.balance };

    case networkActions.SET_R3_INSTANCE:
      return { ...state, r3: action.payload.r3 };

    case networkActions.SET_USER_STELLAR_BALANCE:
      return {
        ...state,
        userStellarSgdrBalance: action.payload.balance[0].balance,
        userStellarBalance: action.payload.balance[1].balance,
      };
  }
  return state;
}
