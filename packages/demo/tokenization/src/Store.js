import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';

import network from './reducers/Network';
import tokenize from './reducers/Tokenize';
import withdraw from './reducers/Withdraw';
import approve from './reducers/Approve';
import transactions from './reducers/Transactions';
import wallet from './reducers/Wallet';
import makeSagas from './effects';

import LocalStorageDB from './db';
import { txType, txStatus } from './constants/enums';

let db = null; // LocalStorageDB.load('tokenization');
if (db === null) {
  db = new LocalStorageDB('tokenization');
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
    from: '0x687422eea2cb73b5d3e242ba5456b782919afc85',
    to: '0x590F39c5dadD62a3e4Ad6E323632cA2B3Ed371ab',
    date: 1533868410000,
    amount: 10,
    type: txType.TOKENIZE,
    status: txStatus.SUCCESS,
  });
  db.insert('transactions', {
    tx_hash: '0xf0079e09c827de362d1a207596be9c0983c8f0ebe1617a727a683362caf9d889',
    from: '0x687422eea2cb73b5d3e242ba5456b782919afc85',
    to: '0x590F39c5dadD62a3e4Ad6E323632cA2B3Ed371ab',
    date: 1533981798000,
    amount: 10,
    type: txType.TOKENIZE,
    status: txStatus.SUCCESS,
  });
  db.insert('transactions', {
    tx_hash: '0xb54dd552e2f1c9814b54d9f0131bbecb4c1f3f02561883fbd16bea2384ec1e51',
    from: '0x687422eea2cb73b5d3e242ba5456b782919afc85',
    to: '0x590F39c5dadD62a3e4Ad6E323632cA2B3Ed371ab',
    date: 1534047413000,
    amount: 10,
    type: txType.WITHDRAWAL,
    status: txStatus.SUCCESS,
  });
  db.insert('transactions', {
    tx_hash: '0xa1bbcaf9e740c8f6b3b3cd332804a06dfa65959f6f80d24116f3f0124cbb34f8',
    from: '0x687422eea2cb73b5d3e242ba5456b782919afc85',
    to: '0x590F39c5dadD62a3e4Ad6E323632cA2B3Ed371ab',
    date: 1534168898000,
    amount: 10,
    type: txType.WITHDRAWAL,
    status: txStatus.PENDING_APPROVAL,
  });
  db.insert('transactions', {
    tx_hash: '0x7305e7edbefa7144a659736e42c6084f8acad6294ae3eb387d1c984d4479ea63',
    from: '0x687422eea2cb73b5d3e242ba5456b782919afc85',
    to: '0x590F39c5dadD62a3e4Ad6E323632cA2B3Ed371ab',
    date: 1534331509000,
    amount: 10,
    type: txType.TOKENIZE,
    status: txStatus.PENDING_APPROVAL,
  });
  db.insert('transactions', {
    tx_hash: '0xe61b6807bb7d3f1c416ad2865eed260f7e4e8523d29d89933a738ac5e01123bf',
    from: '0x687422eea2cb73b5d3e242ba5456b782919afc85',
    to: '0x590F39c5dadD62a3e4Ad6E323632cA2B3Ed371ab',
    date: 1534574341000,
    amount: 10,
    type: txType.WITHDRAWAL,
    status: txStatus.PENDING_NETWORK,
  });
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
    network,
    tokenize,
    withdraw,
    approve,
    transactions,
    wallet,
  }),
  applyMiddleware(...middlewares),
);

sagaMiddleware.run(makeSagas(db));

export default store;
