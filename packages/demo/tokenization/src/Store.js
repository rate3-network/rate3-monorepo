import {
  createStore,
  applyMiddleware,
  combineReducers,
  compose,
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import Web3 from 'web3';

import network from './reducers/Network';
import tokenize from './reducers/Tokenize';
import withdraw from './reducers/Withdraw';
import approve from './reducers/Approve';
import transactions from './reducers/Transactions';
import wallet from './reducers/Wallet';
import makeSagas from './effects';

import LocalStorageDB from './db';

import { dbName } from './constants/storageKeys';

let db = null; // LocalStorageDB.load(dbName);
if (db === null) {
  db = new LocalStorageDB(dbName);
  db.createTable('network', [
    'network_id',
    'block_number',
  ]);
}

let provider = 'https://rinkeby.infura.io';
provider = 'http://localhost:8545';
let browserProvider = null;

if (typeof window !== 'undefined') {
  provider = window.sessionStorage.provider || provider;
  if (window.web3) {
    // Stores the existing provider (i.e. metamask) to allow switching.
    browserProvider = window.web3.currentProvider;
  }
  window.web3 = new Web3(provider);
}

const middlewares = [];

if (process.env.NODE_ENV !== 'production') {
  const { logger } = require('redux-logger');
  middlewares.push(logger);
}

const sagaMiddleware = createSagaMiddleware();
middlewares.push(sagaMiddleware);

const store = createStore(
  combineReducers({
    network: network(window.web3, browserProvider),
    tokenize,
    withdraw,
    approve,
    transactions,
    wallet,
  }),
  applyMiddleware(...middlewares),
);

sagaMiddleware.run(makeSagas(db, window.web3));

export default store;
