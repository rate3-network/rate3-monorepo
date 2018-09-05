import React from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import BlueButton from './BlueButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

import { identityBlue, materialGrey } from './../constants/colors';
import CheckList from './CheckList';

const tutorialSteps = [
  {
    label: 'Cross-Chain Identity',
    text: 'A unified cross-chain identity framework for real-world entities to share identity information.',
  },
  {
    label: 'Who are you?',
    text: 'Your role determines your actions but don’t worry, for this demo you can change it at any time.',
  },
  {
    label: 'Set up Wallet',
    list: [{ value: 'Install Metamask on your browser' },
      { value: 'Sign in and unlock your metamask' },
      { value: 'Switch to a test network', hasStyledText: true },
      { value: 'Obtain some test ether' },
    ],
  },
];

const styles = theme => ({
  header: {
    fontWeight: '900',
    fontSize: '3.5em',
    color: identityBlue,
  },
  text: {
    fontWeight: 'normal',
    lineHeight: '120%',
    fontSize: '1.3em',
    letterSpacing: '0.01em',
    padding: '1em 0em 3em 0em',
  },
  buttonContainer: {
    paddingTop: '10vh',
    alignSelf: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    width: '17vw',
    height: '7vh',
    fontSize: '2em',
    fontWeight: 'bold',
    borderRadius: '50px',
    backgroundColor: identityBlue,
    color: 'white',
    boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.1)',
  },
  mobileStepper: {
    backgroundColor: 'white',
    paddingTop: '1.5em',
  },
  dot: {
    width: '0.6em',
    height: '0.6em',
    marginRight: '0.8rem',
  },
  dotActive: {
    backgroundColor: materialGrey,
  },
  colorInherit: {
    backgroundColor: identityBlue,
    // color: identityBlue,
  },
});

@inject('RootStore') @observer
class OnboardStepper extends React.Component {
  state = {
    activeStep: 0,
    walletProgress: 0, // 0 means no step completed, 1 means step 1 completed, 4 means step 4 completed, etc
  };

  handleNext = () => {
    this.props.RootStore.commonStore.onboardNextStep();
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1,
    }));
  };

  handleBack = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1,
    }));
  };

  render() {
    const { classes, theme } = this.props;
    // const { activeStep } = this.state;

    const maxSteps = tutorialSteps.length;
    const activeStep = this.props.RootStore.commonStore.getActiveOnboardStep() - 1;
    console.log('stepper');
    console.log(this.props.RootStore);
    return (
      <React.Fragment>

        <div className={classes.header}>{tutorialSteps[activeStep].label}</div>
        <div className={classes.text}>
          {tutorialSteps[activeStep].text && tutorialSteps[activeStep].text }
          {tutorialSteps[activeStep].list && <CheckList list={tutorialSteps[activeStep].list} network={this.props.RootStore.commonStore.getCurrentNetwork()} /> }
        </div>
        <div className={classes.buttonContainer}>
          <BlueButton handleClick={this.handleNext}/>
          {/* <Button
            variant="contained"
            size="large"
            // color="primary"
            className={classes.button}
            classes={{
              root: classes.colorInherit,
            }}
          >
            Begin
          </Button> */}
          <MobileStepper
            steps={maxSteps}
            variant="dots"
            classes={{
              dot: classes.dot,
              dotActive: classes.dotActive,
            }}
            position="static"
            activeStep={activeStep}
            className={classes.mobileStepper}
            // nextButton={
            //   <Button size="small" onClick={this.handleNext} disabled={activeStep === maxSteps - 1}>
            //     Next
            //     {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            //   </Button>
            // }
            // backButton={
            //   <Button size="small" onClick={this.handleBack} disabled={activeStep === 0}>
            //     {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            //     Back
            //   </Button>
            // }
          />
        </div>
        
      </React.Fragment>
    );
  }
}

OnboardStepper.propTypes = {
  // classes: PropTypes.object.isRequired,
  // theme: PropTypes.object.isRequired,
};

export default withStyles(styles)(OnboardStepper);
