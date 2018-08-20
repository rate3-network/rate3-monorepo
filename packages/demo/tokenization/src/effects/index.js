import { all } from 'redux-saga/effects';
import Network from './Network';
import Contracts from './Contracts';

export default function* () {
  yield all([
    Network(),
    Contracts(),
  ]);
}
