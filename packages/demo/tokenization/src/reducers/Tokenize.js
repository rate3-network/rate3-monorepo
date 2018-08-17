import { tokenizeActions, tokenizeFields } from '../actions/Tokenize';


const initialState = {
  step: 0,
  loadingNextStep: false,

  [tokenizeFields.amount]: '',
  [tokenizeFields.trustBank]: '',
  [tokenizeFields.trustSwiftCode]: '',
  [tokenizeFields.trustAccount]: '',
  [tokenizeFields.gasLimit]: '',
  [tokenizeFields.gasPrice]: '',
};

/**
 * Reducer for wallet state, which consists of:
 * - The current role
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
    default: {
      return state;
    }
  }
}
