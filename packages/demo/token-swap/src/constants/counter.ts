export const INCREMENT = 'INCREMENT';
export type INCREMENT = typeof INCREMENT;

export const DECREMENT = 'DECREMENT';
export type DECREMENT = typeof DECREMENT;

export const INCREMENT_ASYNC = 'INCREMENT_ASYNC';
export type INCREMENT_ASYNC = typeof INCREMENT_ASYNC;

export const SET_CONTENT = 'SET_CONTENT';
export type SET_CONTENT = typeof SET_CONTENT;

export const REQUEST_CONTENT = 'REQUEST_CONTENT';
export type REQUEST_CONTENT = typeof REQUEST_CONTENT;

export const RECEIVE_CONTENT = 'RECEIVE_CONTENT';
export type RECEIVE_CONTENT = typeof RECEIVE_CONTENT;

export const CONTENT_FAILED = 'CONTENT_FAILED';
export type CONTENT_FAILED = typeof CONTENT_FAILED;

export interface ITitle {
  userId: number;
  id: number;
  title: string;
  compldeted: boolean;
}
