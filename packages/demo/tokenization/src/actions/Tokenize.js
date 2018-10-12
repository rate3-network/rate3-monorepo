import { keyMirror } from '../utils';

export const tokenizeFields = keyMirror({
  amount: null,
  trustBank: null,
  trustSwiftCode: null,
  trustAccount: null,
  gasLimit: null,
  gasPrice: null,
});

export const tokenizeActions = keyMirror(
  {
    NEXT_STEP: null,
    PREV_STEP: null,
    RESET: null,

    SET_FIELD: null,

    SUBMIT_TOKENIZE_REQUEST: null,
  },
  'TOKENIZE',
);

export const nextStep = () => ({
  type: tokenizeActions.NEXT_STEP,
});

export const prevStep = () => ({
  type: tokenizeActions.PREV_STEP,
});

export const reset = () => ({
  type: tokenizeActions.RESET,
});

export const setField = (field, value) => ({
  type: tokenizeActions.SET_FIELD,
  field,
  value,
});

export const submitTokenizeRequest = (
  amount,
  gasLimit,
  gasPrice,
) => ({
  type: tokenizeActions.SUBMIT_TOKENIZE_REQUEST,
  amount,
  gasLimit,
  gasPrice,
});
