import { keyMirror } from '../utils';

export const errorActions = keyMirror(
  {
    NEW: null,
    DISMISS: null,
    CLOSE_ERROR_SNACKBAR: null,
  },
  'ERROR',
);

export const newError = message => ({
  type: errorActions.NEW,
  message,
});

export const dismissError = () => ({
  type: errorActions.DISMISS,
});

export const closeErrorSnackbar = () => ({
  type: errorActions.CLOSE_ERROR_SNACKBAR,
});
