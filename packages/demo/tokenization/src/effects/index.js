import { all } from 'redux-saga/effects';
import Network from './Network';

export default function* () {
  yield all([
    Network(),
  ]);
}
