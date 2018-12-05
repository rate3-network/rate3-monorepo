import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from '../actions/counter';
import { IStoreState } from '../reducers/counter';
import { Button } from '@material-ui/core';
import { IAction } from 'src/utils/general';

export interface IProps {
  value: number;
  content: string;
  error: object;
  isFetching: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
  requestContent: (x: number | null) => void;
}

class Counter extends React.PureComponent<IProps> {
  state = {
    id: null,
  };
  render() {
    const {
      content,
      error,
      onIncrement,
      onDecrement,
      isFetching,
      requestContent,
      value,
    } = this.props;
    return (
    <div>
      <Button>test</Button>
      {' '}
      <button onClick={onIncrement}>
        Increment
      </button>
      {' '}
      <button onClick={onDecrement}>
        Decrement
      </button>
      <hr />
      <input
        type="text"
        onChange={
          (e) => {
            console.log(e.target.value);
            this.setState({ id: e.target.value });
          }
        }
      />
      <button
        onClick={() => {
          requestContent(this.state.id);
        }}
      >
      set
      </button>
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
  return {
    content: counter.content,
    error: counter.error,
    isFetching: counter.isFetching,
    value: counter.value,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
    onDecrement: () => dispatch(actions.decrement()),
    onIncrement: () => dispatch(actions.increment()),
    requestContent: (x: number) => dispatch(actions.requestContent({ id: x }, 'hey')),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(Counter);
