import {
  transactionProgressHeader,
  transactionProgressSubHeader,
} from '../../constants/colors';

export default theme => ({
  header: {
    textAlign: 'center',
    color: transactionProgressHeader,
    letterSpacing: 0,
    marginBottom: theme.spacing.unit,
  },
  subheader: {
    textAlign: 'center',
    color: transactionProgressSubHeader,
  },
  hash: {
    textDecoration: 'underline',
  },
  stepper: {
    margin: `${theme.spacing.unit * 8}px auto`,
    width: '280px',
  },
});
