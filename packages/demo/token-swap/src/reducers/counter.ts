import { ClickAction } from '../actions/counter';

import { CONTENT_FAILED, DECREMENT, ITitle, INCREMENT, INCREMENT_ASYNC, RECEIVE_CONTENT,
  REQUEST_CONTENT, SET_CONTENT } from '../constants/counter';

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

export function counter(state: IStoreState = initialState, action: ClickAction): IStoreState {
  switch (action.type) {
    case INCREMENT:
      return { ...state, value: state.value + 1 };
    case INCREMENT_ASYNC:
      return { ...state };
    case DECREMENT:
      return { ...state, value: Math.max(1, state.value - 1) };
    case SET_CONTENT:
      return { ...state, content: action.content };
    case REQUEST_CONTENT:
      return { ...state, id: action.id, isFetching: true };
    case RECEIVE_CONTENT:
      return { ...state, responseBody: action.responseBody,
        content: action.responseBody.title, isFetching: false };
    case CONTENT_FAILED:
      return { ...state, error: action.error };
  }
  return state;
}
