import * as React from 'react';

export interface IProps {
  name: string;
}

class Sub extends React.PureComponent<IProps> {
  public componentDidMount() {
    const Web3Context = React.createContext('light');
    const contextType = Web3Context;
    console.log(contextType);
  }
  public render() {
    const { name } = this.props;
    return (
        <div className="hello">
          test {name}
        </div>
    );
  }
}

export default Sub;
