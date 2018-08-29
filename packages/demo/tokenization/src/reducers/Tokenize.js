import { Decimal } from 'decimal.js-light';
import { tokenizeActions, tokenizeFields } from '../actions/Tokenize';
import {
  bankName,
  bankSwiftCode,
  bankAccount,
  sgdDecimalPlaces,
} from '../constants/defaults';


const initialState = {
  step: 0,
  loadingNextStep: false,

  currentTransactionHash: '',
  submissionConfirmed: false,
  networkConfirmed: false,
  trusteeApproved: false,
  transactionError: false,

  [tokenizeFields.amount]: '',
  [tokenizeFields.trustBank]: bankName,
  [tokenizeFields.trustSwiftCode]: bankSwiftCode,
  [tokenizeFields.trustAccount]: bankAccount,
  [tokenizeFields.gasLimit]: '150000',
  [tokenizeFields.gasPrice]: '5',
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
      const sanitation = {};
      if (state.step === 0) {
        sanitation[tokenizeFields.amount] = (new Decimal(state[tokenizeFields.amount]))
          .todp(sgdDecimalPlaces, Decimal.ROUND_DOWN)
          .toString();
      }
      return {
        ...state,
        ...sanitation,
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
