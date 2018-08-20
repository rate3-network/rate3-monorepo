import { tokenizeActions, tokenizeFields } from '../actions/Tokenize';


const initialState = {
  step: 0,
  loadingNextStep: false,

  currentTransactionHash: '',
  submissionConfirmed: false,
  networkConfirmed: false,
  issuerApproved: false,
  transactionError: false,

  [tokenizeFields.amount]: '',
  [tokenizeFields.trustBank]: '',
  [tokenizeFields.trustSwiftCode]: '',
  [tokenizeFields.trustAccount]: '',
  [tokenizeFields.gasLimit]: '',
  [tokenizeFields.gasPrice]: '',
};

/**
 * Reducer for tokenize state
 *
 * @param {Object} [state=initialState] Previous state
 * @param {Object} [action={}] Current action
 * @returns {Object} Next state
 */
export default function (state = initialState, action = {}) {
  const { type } = action;
  switch (type) {
    case tokenizeActions.SET_FIELD: {
      const { field, value } = action;
      if (tokenizeFields[field] != null) {
        return {
          ...state,
          [field]: value,
        };
      }
      return state;
    }
    case tokenizeActions.NEXT_STEP: {
      return {
        ...state,
        step: state.step + 1,
        loadingNextStep: false,
      };
    }
    case tokenizeActions.PREV_STEP: {
      return {
        ...state,
        step: Math.max(state.step - 1, 0),
        loadingNextStep: false,
      };
    }
    case tokenizeActions.RESET: {
      return initialState;
    }
    case tokenizeActions.SUBMIT_TOKENIZE_REQUEST: {
      return {
        ...state,
        loadingNextStep: true,
      };
    }
    case `${tokenizeActions.SUBMIT_TOKENIZE_REQUEST}_HASH`: {
      const { hash } = action;
      return {
        ...state,
        loadingNextStep: false,
        step: state.step + 1,
        currentTransactionHash: hash,
      };
    }
    case `${tokenizeActions.SUBMIT_TOKENIZE_REQUEST}_RECEIPT`: {
      return {
        ...state,
        submissionConfirmed: true,
      };
    }
    case `${tokenizeActions.SUBMIT_TOKENIZE_REQUEST}_CONFIRMATION`: {
      return {
        ...state,
        networkConfirmed: true,
      };
    }
    default: {
      return state;
    }
  }
}
