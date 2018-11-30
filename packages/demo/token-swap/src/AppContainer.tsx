import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from './actions/test';
import App from './App';
import { IStoreState } from './reducers/test';
// src/containers/Hello.tsx

export function mapStateToProps({ contract, enthusiasmLevel, languageName, web3Obj }: IStoreState) {
  return {
    contract,
    enthusiasmLevel,
    name: languageName,
    web3: web3Obj,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.EnthusiasmAction>) {
  return {
    onDecrement: () => dispatch(actions.decrementEnthusiasm()),
    onIncrement: () => dispatch(actions.incrementEnthusiasm()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
