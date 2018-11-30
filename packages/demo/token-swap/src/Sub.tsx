import * as React from 'react';

export interface IProps {
  name: string;
}

class Sub extends React.PureComponent<IProps> {
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
