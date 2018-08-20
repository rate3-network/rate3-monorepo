import {
  userConfirmationLabel,
  userConfirmationValue,
} from '../../constants/colors';

export default theme => ({
  root: {
    letterSpacing: 0,
  },
  label: {
    color: userConfirmationLabel,
    marginBottom: '0.5em',
  },
  value: {
    color: userConfirmationValue,
    fontWeight: 'bold',
    marginBottom: '0.5em',
    wordBreak: 'break-word',
  },
});
