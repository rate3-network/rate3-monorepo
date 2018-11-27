import * as W3 from 'web3';
import { EnthusiasmAction } from '../actions/test';

import { DECREMENT_ENTHUSIASM, INCREMENT_ENTHUSIASM } from '../constants/test';

export interface IStoreState {
  languageName: string;
  enthusiasmLevel: number;
  web3Obj: W3.default;
}

export function enthusiasm(state: IStoreState, action: EnthusiasmAction): IStoreState {
  switch (action.type) {
    case INCREMENT_ENTHUSIASM:
      return { ...state, enthusiasmLevel: state.enthusiasmLevel + 1 };
    case DECREMENT_ENTHUSIASM:
      return { ...state, enthusiasmLevel: Math.max(1, state.enthusiasmLevel - 1) };
  }
  return state;
}
