import { keyMirror } from '../utils';

export const finalizeFields = keyMirror({
  gasLimit: null,
  gasPrice: null,
});

export const finalizeActions = keyMirror(
  {
    NEXT_STEP: null,
    PREV_STEP: null,
    RESET: null,

    SELECT_TRANSACTION_TO_FINALIZE: null,
    SELECT_TRANSACTION_TO_REVOKE: null,
    SET_FIELD: null,

    SUBMIT_REQUEST: null,
  },
  'FINALIZE',
);

export const nextStep = () => ({
  type: finalizeActions.NEXT_STEP,
});

export const prevStep = () => ({
  type: finalizeActions.PREV_STEP,
});

export const reset = () => ({
  type: finalizeActions.RESET,
});

export const setField = (field, value) => ({
  type: finalizeActions.SET_FIELD,
  field,
  value,
});

export const selectTransactionToFinalize = transaction => ({
  type: finalizeActions.SELECT_TRANSACTION_TO_FINALIZE,
  transaction,
});

export const selectTransactionToRevoke = transaction => ({
  type: finalizeActions.SELECT_TRANSACTION_TO_REVOKE,
  transaction,
});

export const submitRequest = (
  requestId,
  requesterAddr,
  gasLimit,
  gasPrice,
) => ({
  type: finalizeActions.SUBMIT_REQUEST,
  requestId,
  requesterAddr,
  gasLimit,
  gasPrice,
});
