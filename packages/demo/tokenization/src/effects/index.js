import { all } from 'redux-saga/effects';
import Network from './Network';
import Contracts from './Contracts';
import Wallet from './Wallet';
import Transactions from './Transactions';
import Errors from './Errors';

export default (db, web3) => (function* saga() {
  yield all([
    Network(db, web3)(),
    Contracts(db, web3)(),
    Wallet(db, web3)(),
    Transactions(db, web3)(),
    Errors(db, web3)(),
  ]);
});
