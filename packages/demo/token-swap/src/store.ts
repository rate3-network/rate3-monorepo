import { createStore } from 'redux';
import { enthusiasm } from './reducers/test';
const Web3 = require('web3'); // tslint:disable-line
// import * as W3 from 'web3';

// interface IStoreState {
//   languageName: string;
//   enthusiasmLevel: number;
//   web3Obj: W3;
//   // contract: object;
// }
export const store = createStore(
  enthusiasm,
  {
    enthusiasmLevel: 1,
    languageName: 'TypeScript',
    web3Obj: new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws')),
  }
);
