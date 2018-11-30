import * as constants from '../constants/counter';

export interface IIncrement {
  type: constants.INCREMENT;
}

export interface IIncrementAsync {
  type: constants.INCREMENT_ASYNC;
}

export interface IDecrement {
  type: constants.DECREMENT;
}
export interface ISetContent {
  type: constants.SET_CONTENT;
  content: string;
}
export interface IRequestContent {
  type: constants.REQUEST_CONTENT;
  id: number;
}
export interface IReceiveContent {
  type: constants.RECEIVE_CONTENT;
  responseBody: constants.ITitle;
  content: string;
}
export interface IContentFailed {
  type: constants.CONTENT_FAILED;
  error: object;
}

export type ClickAction = IContentFailed | IIncrement | IDecrement
  | IIncrementAsync | ISetContent | IRequestContent | IReceiveContent;

export function increment(): IIncrement {
  return {
    type: constants.INCREMENT,
  };
}
export function incrementAsync(): IIncrementAsync {
  return {
    type: constants.INCREMENT_ASYNC,
  };
}
export function decrement(): IDecrement {
  return {
    type: constants.DECREMENT,
  };
}
export function setContent(data: string): ISetContent {
  return {
    content: data,
    type: constants.SET_CONTENT,
  };
}
export function requestContent(id: number): IRequestContent {
  return {
    id,
    type: constants.REQUEST_CONTENT,
  };
}
export function receiveContent(responseBody: constants.ITitle): IReceiveContent {
  return {
    responseBody,
    content: responseBody.title,
    type: constants.RECEIVE_CONTENT,
  };
}
