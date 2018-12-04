import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from '../actions/counter';
import { IStoreState } from '../reducers/counter';
import { Button } from '@material-ui/core';

export interface IProps {
  value: number;
  content: string;
  error: object;
  isFetching: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onIncrementAsync?: () => void;
  requestContent?: () => void;
  requestContent2?: () => void;
}

class Counter extends React.PureComponent<IProps> {
  render() {
    const { content, error, onIncrementAsync, onIncrement, onDecrement, isFetching,
      requestContent, value, requestContent2 } = this.props;
    return (
    <div>
      <Button>test</Button>
      <button onClick={onIncrementAsync}>
        Increment after 1 second
      </button>
      {' '}
      <button onClick={onIncrement}>
        Increment
      </button>
      {' '}
      <button onClick={onDecrement}>
        Decrement
      </button>
      <hr />
      <button onClick={requestContent}>set</button>
      <button onClick={requestContent2}>set2</button>
      <hr />
      <div>
        Clicked: {value} times
      </div>
      <div>
        content:
        <br/>
        {content}
      </div>
      <br/>
      {isFetching ? 'fetching........' : ''}
      <hr/>
      {error && `'Error: ' ${JSON.stringify(error)}`}
    </div>
    );
  }

}
export interface IStates {
  counter: IStoreState;
}

export function mapStateToProps({ counter }: IStates) {
  console.log(counter);
  return {
    content: counter.content,
    error: counter.error,
    isFetching: counter.isFetching,
    value: counter.value,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.ClickAction>) {
  return {
    onDecrement: () => dispatch(actions.decrement()),
    onIncrement: () => dispatch(actions.increment()),
    onIncrementAsync: () => dispatch(actions.incrementAsync()),
    requestContent: () => dispatch(actions.requestContent(3)),
    requestContent2: () => dispatch(actions.requestContent(4)),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(Counter);
