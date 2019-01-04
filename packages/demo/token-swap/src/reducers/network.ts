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
import { IE2SRequest, IS2ERequest } from './issuer';
import { clone } from 'lodash';

export interface IStoreState {
  r3Stellar: typeof r3Stellar;
  r3: typeof r3Stellar | null;
  role: ROLES | null;
  contract: Contract.default | null;
  tokenContract: Contract.default | null;
  web3Obj: W3.default | null;
  userEthBalance: string;
  userEthSgdrBalance: string;
  userStellarBalance: string;
  userStellarSgdrBalance: string;
  issuerEthBalance: string;
  issuerStellarBalance: string;
  selectedTx: string;
  pendingTxMap: {} | Map<string, IS2ERequest | IE2SRequest>;
}

export const initialState = {
  r3Stellar,
  r3: null,
  role: null,
  contract: null,
  tokenContract: null,
  web3Obj: null,
  userEthBalance: 'loading...',
  userStellarBalance: 'loading...',
  userStellarSgdrBalance: 'loading...',
  userEthSgdrBalance: 'loading...',
  issuerEthBalance: 'loading...',
  issuerStellarBalance: 'loading...',
  selectedTx: '',
  pendingTxMap: {},
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
        '0x121159a9a1731fec0690ac92a448795ac3f5d97d'
      );
      const tokenContractUser  = new web3User.eth.Contract(
        Erc20Abi,
        '0x24c443b8d7da931c14f2f84e1b1d218187f11255'
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
        '0x121159a9a1731fec0690ac92a448795ac3f5d97d'
      );
      const tokenContract  = new web3Issuer.eth.Contract(
        Erc20Abi,
        '0x24c443b8d7da931c14f2f84e1b1d218187f11255'
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
      return {
        ...state,
        userEthSgdrBalance: action.payload.sgdrBalance,
        userEthBalance: action.payload.balance,
      };

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
    case networkActions.SET_ISSUER_STELLAR_BALANCE:
      return {
        ...state,
        issuerStellarBalance: action.payload.balance[0].balance,
      };
    case networkActions.SELECT_TX:
      const hash = action.payload;
      return {
        ...state,
        selectedTx: hash,
      };
    case networkActions.RESET_SELECTED_TX:
      return {
        ...state,
        selectedTx: '',
      };
    case networkActions.ADD_TO_MAP:
      const newRequest = action.payload;
      const newMap = clone(state.pendingTxMap);
      const key = newRequest.hash;
      newMap[key] = newRequest;
      return {
        ...state,
        pendingTxMap: newMap,
      };
  }
  return state;
}
