import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';

import network from './reducers/Network';
import sagas from './effects';

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
  }),
  applyMiddleware(...middlewares),
);

sagaMiddleware.run(sagas);

export default store;
