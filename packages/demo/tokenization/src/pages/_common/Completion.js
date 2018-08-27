import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import TransactionProgressStepper from '../../components/TransactionProgressStepper';

import {
  transactionProgressHeader,
  transactionProgressSubHeader,
} from '../../constants/colors';

const styles = theme => ({
  header: {
    textAlign: 'center',
    color: transactionProgressHeader,
    letterSpacing: 0,
    marginBottom: theme.spacing.unit,
  },
  subheader: {
    textAlign: 'center',
    color: transactionProgressSubHeader,
    wordBreak: 'break-word',
    '& .hash': {
      textDecoration: 'underline',
    },
  },
  stepper: {
    margin: `${theme.spacing.unit * 8}px auto`,
    width: '280px',
  },
});

const Completion = ({
  classes,
  header,
  subheader,
  progressSteps,
}) => (
  <React.Fragment>
    <h1 className={classes.header}>
      {header}
    </h1>
    <div className={classes.subheader}>
      {subheader}
    </div>
    <div className={classes.stepper}>
      <TransactionProgressStepper
        steps={progressSteps}
      />
    </div>
  </React.Fragment>
);

Completion.propTypes = {
  classes: PropTypes.object.isRequired,
  header: PropTypes.node.isRequired,
  subheader: PropTypes.node,
  progressSteps: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.node.isRequired,
    completed: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
  })).isRequired,
};

Completion.defaultProps = {
  subheader: null,
};

export default withStyles(styles, { withTheme: true })(Completion);
