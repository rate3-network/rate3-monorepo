import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepIcon from '@material-ui/core/StepIcon';
import StepConnector from '@material-ui/core/StepConnector';
import { genStyle, getClass } from '../utils';
import {
  userStepperIcon,
  issuerStepperIcon,
  stepperIconActive,
  stepperIconCompleted,
  userStepperText,
  issuerStepperText,
  userStepperActiveText,
  issuerStepperActiveText,
  userStepperCompletedText,
  issuerStepperCompletedText,
} from '../constants/colors';


const styles = theme => ({
  stepperRoot: {
    backgroundColor: 'inherit',
    padding: 0,
  },
  ...genStyle('labelRoot', isUser => ({
    backgroundColor: 'inherit',
    paddingLeft: 0,
    paddingRight: 0,
    zIndex: 2,
    position: 'relative',
  })),
  ...genStyle('labelText', isUser => ({
    color: isUser ? userStepperText : issuerStepperText,
    wordBreak: 'break-word',
    letterSpacing: 0,
  })),
  ...genStyle('labelActive', isUser => ({
    color: isUser ? userStepperActiveText : issuerStepperActiveText,
  })),
  ...genStyle('labelCompleted', isUser => ({
    color: `${isUser ? userStepperCompletedText : issuerStepperCompletedText} !important`,
  })),
  ...genStyle('iconRoot', isUser => ({
    color: `${isUser ? userStepperIcon : issuerStepperIcon} !important`,
    borderRadius: '50%',
    border: '0.4em solid transparent',
    width: '2em',
    height: '2em',
  })),
  iconRoot: {
  },
  iconActive: {
    color: `${stepperIconActive} !important`,
    border: `0.4em solid ${'rgba(32, 53, 66, 0.2)'}`,
  },
  iconCompleted: {
    color: `${stepperIconCompleted} !important`,
  },
  connectorRoot: {
    top: '2em',
    zIndex: 1,
  },
  connectorLine: {
    backgroundColor: '#EBF0F3',
    height: '8px',
    borderTop: 'none',
  },
});

const CustomStepper = ({
  classes,
  isUser,
  steps,
  currentStep,
}) => (
  <div>
    <Stepper
      alternativeLabel
      activeStep={currentStep}
      classes={{ root: classes.stepperRoot }}
    >
      {steps.map((label, index) => (
        <Step
          key={label}
          connector={(
            <StepConnector
              classes={{
                root: classes.connectorRoot,
                line: classes.connectorLine,
              }}
            />
          )}
        >
          <StepLabel
            icon={(
              <StepIcon
                icon={index + 1}
                // Using the completed prop will result in the icon being a tick
                // By combining active and completed we can customized it more
                // using css.
                active={index <= currentStep}
                classes={{
                  root: getClass(classes, 'iconRoot', isUser),
                  active: index < currentStep
                    ? classes.iconCompleted
                    : classes.iconActive,
                }}
                component={index + 1}
              />
            )}
            classes={{
              root: getClass(classes, 'labelRoot', isUser),
              label: getClass(classes, 'labelText', isUser),
              active: getClass(classes, 'labelActive', isUser),
              completed: getClass(classes, 'labelCompleted', isUser),
            }}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  </div>
);

CustomStepper.propTypes = {
  classes: PropTypes.object.isRequired,
  isUser: PropTypes.bool.isRequired,
  currentStep: PropTypes.number.isRequired,
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default withStyles(styles, { withTheme: true })(CustomStepper);
