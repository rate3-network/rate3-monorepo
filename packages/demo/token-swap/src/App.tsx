import * as React from 'react';
import Sub from './Sub';

// const contractJson = require('./contract.json');

// const web3Constructor = require('web3');

export interface IProps {
  name: string;
  enthusiasmLevel?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  web3: any;
  contract: any;
}

class Hello extends React.PureComponent<IProps> {
  componentDidMount() {
    console.log(this.props);
  }
  render() {
    const { name, enthusiasmLevel = 1, onIncrement, onDecrement } = this.props;
    if (enthusiasmLevel <= 0) {
      throw new Error('You could be a little more enthusiastic. :D');
    }
    return (
      <div className="hello">
        <div>
          <button onClick={onDecrement}>-</button>
          <button onClick={onIncrement}>+</button>
        </div>
      </div>
    );
  }
}

export default Hello;
