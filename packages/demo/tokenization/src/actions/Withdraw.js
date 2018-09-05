import { keyMirror } from '../utils';

export const withdrawFields = keyMirror({
  amount: null,
  gasLimit: null,
  gasPrice: null,
});

export const withdrawActions = keyMirror(
  {
    NEXT_STEP: null,
    PREV_STEP: null,
    RESET: null,

    SET_FIELD: null,

    SUBMIT_WITHDRAW_REQUEST: null,
  },
  'WITHDRAW',
);

export const nextStep = () => ({
  type: withdrawActions.NEXT_STEP,
});

export const prevStep = () => ({
  type: withdrawActions.PREV_STEP,
});

export const reset = () => ({
  type: withdrawActions.RESET,
});

export const setField = (field, value) => ({
  type: withdrawActions.SET_FIELD,
  field,
  value,
});

export const submitWithdrawRequest = (
  amount,
  gasLimit,
  gasPrice,
) => ({
  type: withdrawActions.SUBMIT_WITHDRAW_REQUEST,
  amount,
  gasLimit,
  gasPrice,
});
