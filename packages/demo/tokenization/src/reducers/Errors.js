import { errorActions } from '../actions/Errors';

const initialState = {
  errorQueue: [],
  showErrorSnackbar: false,
};

/**
 * Reducer for errors state
 *
 * @param {Object} [state=initialState] Previous state
 * @param {Object} [action={}] Current action
 * @returns {Object} Next state
 */
export default function (state = initialState, action = {}) {
  const { type } = action;
  switch (type) {
    case errorActions.NEW: {
      const { message } = action;
      return {
        ...state,
        errorQueue: [...state.errorQueue, message],
        showErrorSnackbar: true,
      };
    }
    case errorActions.DISMISS: {
      const newQueue = state.errorQueue.slice(1);
      return {
        ...state,
        errorQueue: newQueue,
        showErrorSnackbar: newQueue.length > 0,
      };
    }
    case errorActions.CLOSE_ERROR_SNACKBAR: {
      return {
        ...state,
        showErrorSnackbar: false,
      };
    }
    default: {
      return state;
    }
  }
}
