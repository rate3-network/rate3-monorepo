import * as React from 'react';
import AppContainer from './AppContainer';
import Counter from './components/Counter';
// const contractJson = require('./contract.json');

// const web3Constructor = require('web3');

class Main extends React.PureComponent {
  public render() {
    return (
      <div className="Main">
        <AppContainer />
        <hr/>
        redux
        <Counter />
      </div>
    );
  }
}

export default Main;
