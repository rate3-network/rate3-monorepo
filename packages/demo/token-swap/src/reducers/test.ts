import * as W3 from 'web3';
import * as Contract from 'web3/eth/contract';
import { EnthusiasmAction } from '../actions/test';
const Web3 = require('web3'); // tslint:disable-line
const contractJson = require('../contract.json');

import { DECREMENT_ENTHUSIASM, INCREMENT_ENTHUSIASM } from '../constants/test';

export interface IStoreState {
  contract: Contract.default;
  languageName: string;
  enthusiasmLevel: number;
  web3Obj: W3.default;
}

const web3: W3.default =
  new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
export const initialState = {
  contract: new web3.eth.Contract(contractJson.abi, contractJson.address),
  enthusiasmLevel: 4,
  languageName: 'TypeScript',
  web3Obj: web3,
};

export function enthusiasm(state: IStoreState = initialState, action: EnthusiasmAction):
IStoreState {
  switch (action.type) {
    case INCREMENT_ENTHUSIASM:
      return { ...state, enthusiasmLevel: state.enthusiasmLevel + 1 };
    case DECREMENT_ENTHUSIASM:
      return { ...state, enthusiasmLevel: Math.max(1, state.enthusiasmLevel - 1) };
  }
  return state;
}
