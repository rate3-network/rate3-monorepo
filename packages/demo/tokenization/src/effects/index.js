import { all } from 'redux-saga/effects';
import Network from './Network';
import Contracts from './Contracts';
import Wallet from './Wallet';
import Transactions from './Transactions';

export default db => (function* saga() {
  yield all([
    Network(db)(),
    Contracts(db)(),
    Wallet(db)(),
    Transactions(db)(),
  ]);
});
