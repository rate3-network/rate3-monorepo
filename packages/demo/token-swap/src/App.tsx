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
  public componentDidMount() {
    console.log(this.props);
    // const provider: object = new Web3.providers.WebsocketProvider(
    //   'wss://ropsten.infura.io/ws');
    // const web3Instance: object = new Web3();
    // const mmContract = new web3Instance.eth.Contract(
    //   contractJson.abi,
    //   '0x42EBE1Bba61B06A074277F7Aeb10052B8e47FBF1'
    // );
    // console.log(web3);
  }
  public render() {
    const { name, enthusiasmLevel = 1, onIncrement, onDecrement } = this.props;
    if (enthusiasmLevel <= 0) {
      throw new Error('You could be a little more enthusiastic. :D');
    }
    return (
      <div className="hello">
        <div className="greeting">
          Hello {name + getExclamationMarks(enthusiasmLevel)}
        </div>
        <Sub name="sdf" />
        <div>
          <button onClick={onDecrement}>-</button>
          <button onClick={onIncrement}>+</button>
        </div>
      </div>
    );
  }
}

export default Hello;

function getExclamationMarks(numChars: number) {
  return Array(numChars + 1).join('!');
}
