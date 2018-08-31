import {
  createStore,
  applyMiddleware,
  combineReducers,
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import Web3 from 'web3';

import network from './reducers/Network';
import tokenize from './reducers/Tokenize';
import withdraw from './reducers/Withdraw';
import approve from './reducers/Approve';
import finalize from './reducers/Finalize';
import transactions from './reducers/Transactions';
import wallet from './reducers/Wallet';
import makeSagas from './effects';

import DB from './db';

import { dbName } from './constants/storageKeys';
import { ropsten } from './constants/addresses';

const db = new DB(dbName);

db.createTable('network', [
  'network_id',
  'block_number',
]);
db.insert('network', { network_id: 3, block_number: 3937004 });
db.insert('network', { network_id: 4, block_number: 2902285 });
db.insert('network', { network_id: 42, block_number: 8544488 });

let provider = ropsten.endpoint;
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
  // eslint-disable-next-line global-require
  const { logger } = require('redux-logger');
  middlewares.push(logger);

  window.db = db;
}

const sagaMiddleware = createSagaMiddleware();
middlewares.push(sagaMiddleware);

const store = createStore(
  combineReducers({
    network: network(window.web3, browserProvider),
    tokenize,
    withdraw,
    approve,
    finalize,
    transactions,
    wallet,
  }),
  applyMiddleware(...middlewares),
);

sagaMiddleware.run(makeSagas(db, window.web3));

export default store;
