// tslint:disable:no-angle-bracket-type-assertion
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga'; // tslint:disable-line:import-name

import { counter } from './reducers/counter';
import { network } from './reducers/network';
import { user } from './reducers/user';
import { issuer } from './reducers/issuer';

import rootSaga from './sagas/rootSaga'; // tslint:disable-line:import-name
const rootReducer = combineReducers({
  network,
  counter,
  user,
  issuer,
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
