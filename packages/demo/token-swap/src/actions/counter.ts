import { IAction, createAction, keyMirror } from '../utils/general';

export type ClickAction = IAction;

export const counterActions = keyMirror(
  {
    INCREMENT: null,
    DECREMENT: null,
    INCREMENT_ASYNC: null,
    SET_CONTENT: null,
    REQUEST_CONTENT: null,
    RECEIVE_CONTENT: null,
  },
  'COUNTER'
);

export const increment = createAction<void, void>(counterActions.INCREMENT);
export const decrement = createAction<void, void>(counterActions.DECREMENT);
export const incrementAsync = createAction<void, void>(counterActions.INCREMENT_ASYNC);
export const setContent = createAction<void, void>(counterActions.SET_CONTENT);
export const requestContent = createAction<{ id: number }, string>(counterActions.REQUEST_CONTENT);
export const receiveContent = createAction<void, void>(counterActions.RECEIVE_CONTENT);
