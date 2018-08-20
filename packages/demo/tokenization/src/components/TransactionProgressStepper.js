import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepIcon from '@material-ui/core/StepIcon';
import StepConnector from '@material-ui/core/StepConnector';
import StepLabel from '@material-ui/core/StepLabel';
import {
  transactionProgressText,
  transactionProgressStepperIcon,
  transactionProgressStepperIconCompleted,
  transactionProgressStepperIconError,
} from '../constants/colors';

const styles = theme => ({
  root: {
    padding: 0,
    backgroundColor: 'inherit',
  },
  labelRoot: {
    color: `${transactionProgressText} !important`,
    fontWeight: 'inherit !important',
  },
  connectorRoot: {
    padding: 0,
    marginLeft: '7px',
  },
  connectorLine: {
    margin: 0,
    minHeight: '30px',
  },
  iconRoot: {
    width: '14px',
    height: '14px',
    marginRight: '1em',
    color: transactionProgressStepperIcon,
  },
  iconCompleted: {
    color: `${transactionProgressStepperIconCompleted} !important`,
  },
  iconError: {
    color: `${transactionProgressStepperIconError} !important`,
  },
});

const findActiveStep = (steps) => {
  for (let i = 0; i < steps.length; i += 1) {
    if (steps[i].completed === false) {
      return i;
    }
  }
  return steps.length;
};

const TransactionProgressStepper = ({ classes, steps }) => (
  <Stepper
    orientation="vertical"
    activeStep={findActiveStep(steps)}
    classes={{
      root: classes.root,
    }}
    connector={(
      <StepConnector
        classes={{
          root: classes.connectorRoot,
          line: classes.connectorLine,
        }}
      />
    )}
  >
    {steps.map((step, index) => (
      <Step
        key={step.text}
        completed={step.completed}

      >
        <StepLabel
          icon={(
            <StepIcon
              icon=""
              active={step.completed}
              error={step.error}
              classes={{
                root: classes.iconRoot,
                active: classes.iconCompleted,
                error: classes.iconError,
              }}
            />
          )}
          classes={{
            root: classes.labelRoot,
            active: classes.labelRoot,
            completed: classes.labelRoot,
            label: classes.labelRoot,
          }}
        >
          {step.text}
        </StepLabel>
      </Step>
    ))}
  </Stepper>
);

TransactionProgressStepper.propTypes = {
  classes: PropTypes.object.isRequired,
  steps: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
  })).isRequired,
};

export default withStyles(styles)(TransactionProgressStepper);
