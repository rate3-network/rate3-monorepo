// tslint:disable:no-angle-bracket-type-assertion
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga'; // tslint:disable-line:import-name

import { counter } from './reducers/counter';
import { enthusiasm } from './reducers/test';

import rootSaga from './sagas/test'; // tslint:disable-line:import-name
const rootReducer = combineReducers({
  counter,
  test: enthusiasm,
});
const sagaMiddleware = createSagaMiddleware();

const composeEnhancers = (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// const web3: W3.default =
//   new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));

export const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(sagaMiddleware)
  )
);
sagaMiddleware.run(rootSaga);
