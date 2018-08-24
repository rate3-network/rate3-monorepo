import { createStore, applyMiddleware, combineReducers } from 'redux';
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
import { txType, txStatus } from './constants/enums';

import { dbName } from './constants/storageKeys';
import { accountAddresses } from './constants/addresses';

let db = null; // LocalStorageDB.load(dbName);
if (db === null) {
  db = new LocalStorageDB(dbName);
  db.createTable('transactions', [
    'tx_hash',
    'from',
    'to',
    'date',
    'amount',
    'type',
    'status',
  ]);
  db.createTable('network', [
    'network_id',
    'block_number',
  ]);
  db.insert('transactions', {
    tx_hash: '0xb006be1d3a4774305ef23270215edc855f05b60790b96fa3f31a52abb4fe251d',
    from: accountAddresses.user,
    to: accountAddresses.trustee,
    date: 1533868410000,
    amount: 10,
    type: txType.TOKENIZE,
    status: txStatus.SUCCESS,
  });
  db.insert('transactions', {
    tx_hash: '0xf0079e09c827de362d1a207596be9c0983c8f0ebe1617a727a683362caf9d889',
    from: accountAddresses.user,
    to: accountAddresses.trustee,
    date: 1533981798000,
    amount: 10,
    type: txType.TOKENIZE,
    status: txStatus.SUCCESS,
  });
  db.insert('transactions', {
    tx_hash: '0xb54dd552e2f1c9814b54d9f0131bbecb4c1f3f02561883fbd16bea2384ec1e51',
    from: accountAddresses.user,
    to: accountAddresses.trustee,
    date: 1534047413000,
    amount: 10,
    type: txType.WITHDRAWAL,
    status: txStatus.SUCCESS,
  });
  db.insert('transactions', {
    tx_hash: '0xa1bbcaf9e740c8f6b3b3cd332804a06dfa65959f6f80d24116f3f0124cbb34f8',
    from: accountAddresses.user,
    to: accountAddresses.trustee,
    date: 1534168898000,
    amount: 10,
    type: txType.WITHDRAWAL,
    status: txStatus.PENDING_APPROVAL,
  });
  db.insert('transactions', {
    tx_hash: '0x7305e7edbefa7144a659736e42c6084f8acad6294ae3eb387d1c984d4479ea63',
    from: accountAddresses.user,
    to: accountAddresses.trustee,
    date: 1534331509000,
    amount: 10,
    type: txType.TOKENIZE,
    status: txStatus.PENDING_APPROVAL,
  });
  db.insert('transactions', {
    tx_hash: '0xe61b6807bb7d3f1c416ad2865eed260f7e4e8523d29d89933a738ac5e01123bf',
    from: accountAddresses.user,
    to: accountAddresses.trustee,
    date: 1534574341000,
    amount: 10,
    type: txType.WITHDRAWAL,
    status: txStatus.PENDING_NETWORK,
  });
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
