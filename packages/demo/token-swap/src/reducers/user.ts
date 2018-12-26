// tslint:disable:import-name
import { userActions } from '../actions/user';
import * as W3 from '../web3Exported';
import * as Contract from 'web3/eth/contract';
import { TransactionReceipt } from 'web3/types';
const Web3 = require('web3');
const ConversionReceiverAbi = require('../constants/ConversionReceiverJson.json').abi;
const Erc20Abi = require('../constants/ERC20.json').abi;
import { USER_ETH_PRIV, ISSUER_ETH_PRIV } from '../constants/defaults';
import { IAction } from '../utils/general';
import { ROLES } from '../constants/general';
// import * as Stellar from 'stellar-sdk';
import r3Stellar from '../r3-stellar-js/r3-stellar';

export interface IStoreState {
  e2sTx: null | TransactionReceipt;
}

export const initialState = {
  e2sTx: null,
};
// const wsProvider = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws');
const wsProvider = new Web3.providers.WebsocketProvider('ws://localhost:8545');

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
