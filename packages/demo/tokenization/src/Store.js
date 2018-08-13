import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';

import network from './reducers/Network';

const sagaMiddleware = createSagaMiddleware();

export default createStore(
  combineReducers({
    network,
  }),
  applyMiddleware(sagaMiddleware),
);
