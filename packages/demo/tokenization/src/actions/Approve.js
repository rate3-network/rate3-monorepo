import { keyMirror } from '../utils';

export const approveFields = keyMirror({
  gasLimit: null,
  gasPrice: null,
});

export const approveActions = keyMirror(
  {
    NEXT_STEP: null,
    PREV_STEP: null,
    RESET: null,

    SELECT_TRANSACTION_TO_APPROVE: null,
    SET_FIELD: null,

    SUBMIT_APPROVE_REQUEST: null,
  },
  'APPROVE',
);

export const nextStep = () => ({
  type: approveActions.NEXT_STEP,
});

export const prevStep = () => ({
  type: approveActions.PREV_STEP,
});

export const reset = () => ({
  type: approveActions.RESET,
});

export const setField = (field, value) => ({
  type: approveActions.SET_FIELD,
  field,
  value,
});

export const selectTransactionToApprove = transaction => ({
  type: approveActions.SELECT_TRANSACTION_TO_APPROVE,
  transaction,
});

export const submitApproveRequest = (
  requestId,
  requesterAddr,
  gasLimit,
  gasPrice,
) => ({
  type: approveActions.SUBMIT_APPROVE_REQUEST,
  requestId,
  requesterAddr,
  gasLimit,
  gasPrice,
});
