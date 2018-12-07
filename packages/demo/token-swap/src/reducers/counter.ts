import { counterActions } from '../actions/counter';

import { IAction } from '../utils/general';

export interface ITitle {
  userId: number;
  id: number;
  title: string;
  compldeted: boolean;
}

export interface IStoreState {
  value: number;
  content: string;
  id: number | undefined;
  responseBody: ITitle | undefined;
  isFetching: boolean;
  error: object | undefined;
}
export const initialState = {
  content: 'hello guys',
  error: undefined,
  id: undefined,
  isFetching: false,
  responseBody: undefined,
  value: 1,
};

export function counter(
  state: IStoreState = initialState,
  action: IAction): IStoreState {
  switch (action.type) {
    case counterActions.INCREMENT:
      console.log(state.value);
      return { ...state, value: state.value + 1 };
    case counterActions.INCREMENT_ASYNC:
      return { ...state };
    case counterActions.DECREMENT:
      return { ...state, value: Math.max(1, state.value - 1) };
    case counterActions.SET_CONTENT:
      return { ...state, content: action.payload.content };
    case counterActions.REQUEST_CONTENT:
      return { ...state, id: action.payload.id, isFetching: true };
    case counterActions.RECEIVE_CONTENT:
      console.log(action);
      return { ...state, responseBody: action.payload.responseBody,
        content: action.payload.responseBody.title, isFetching: false };
    case counterActions.CONTENT_FAILED:
      return { ...state, error: action.payload.error };
  }
  return state;
}
