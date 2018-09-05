import { finalizeActions, finalizeFields } from '../actions/Finalize';


const initialState = {
  step: 0,
  loadingNextStep: false,

  selectedTransaction: null,
  toRevoke: false,

  currentTransactionHash: '',
  submissionConfirmed: false,
  networkConfirmed: false,
  tokensIssued: false,
  tokenizationRevoked: false,
  transactionError: false,

  [finalizeFields.gasLimit]: '150000',
  [finalizeFields.gasPrice]: '5',
};

/**
 * Reducer for finalize state
 *
 * @param {Object} [state=initialState] Previous state
 * @param {Object} [action={}] Current action
 * @returns {Object} Next state
 */
export default function (state = initialState, action = {}) {
  const { type } = action;
  switch (type) {
    case finalizeActions.SET_FIELD: {
      const { field, value } = action;
      if (finalizeFields[field] != null) {
        return {
          ...state,
          [field]: value,
        };
      }
      return state;
    }
    case finalizeActions.SELECT_TRANSACTION_TO_FINALIZE: {
      const { transaction } = action;
      return {
        ...state,
        step: state.step + 1,
        selectedTransaction: transaction,
        toRevoke: false,
      };
    }
    case finalizeActions.SELECT_TRANSACTION_TO_REVOKE: {
      const { transaction } = action;
      return {
        ...state,
        step: state.step + 1,
        selectedTransaction: transaction,
        toRevoke: true,
      };
    }
    case finalizeActions.NEXT_STEP: {
      return {
        ...state,
        step: state.step + 1,
        loadingNextStep: false,
      };
    }
    case finalizeActions.PREV_STEP: {
      return {
        ...state,
        step: Math.max(state.step - 1, 0),
        selectedTransaction: state.step === 1 ? null : state.selectedTransaction,
        toRevoke: state.step === 1 ? false : state.toRevoke,
        loadingNextStep: false,
      };
    }
    case finalizeActions.RESET: {
      return initialState;
    }
    case finalizeActions.SUBMIT_REQUEST: {
      return {
        ...state,
        loadingNextStep: true,
      };
    }
    case `${finalizeActions.SUBMIT_REQUEST}_HASH`: {
      const { hash } = action;
      return {
        ...state,
        loadingNextStep: false,
        step: state.step + 1,
        currentTransactionHash: hash,
        submissionConfirmed: false,
        networkConfirmed: false,
        tokensIssued: false,
        tokenizationRevoked: false,
        transactionError: false,
      };
    }
    case `${finalizeActions.SUBMIT_REQUEST}_RECEIPT`: {
      return {
        ...state,
        submissionConfirmed: true,
      };
    }
    case `${finalizeActions.SUBMIT_REQUEST}_CONFIRMATION`: {
      return {
        ...state,
        submissionConfirmed: true,
        networkConfirmed: true,
        tokensIssued: state.toRevoke ? state.tokensIssued : true,
        tokenizationRevoked: state.toRevoke ? true : state.tokenizationRevoked,
      };
    }
    default: {
      return state;
    }
  }
}
