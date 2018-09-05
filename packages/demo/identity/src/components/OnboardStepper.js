import React from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import { translate } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import BlueButton from './BlueButton';
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
  handleNext = () => {
    this.props.RootStore.commonStore.onboardNextStep();
  }

  directToHome = () => {
    this.props.history.push('/');
  }

  render() {
    const { classes, theme } = this.props;
    const maxSteps = tutorialSteps.length;
    const activeOnboardStep = this.props.RootStore.commonStore.getActiveOnboardStep();
    
    let buttonText;
    let buttonAction;
    // change button text and onClick action according which onboarding step use is on
    switch (activeOnboardStep) {
      case 1:
        buttonText = this.props.t('begin');
        buttonAction = this.handleNext;
        break;
      case 2:
        buttonText = this.props.t('next');
        buttonAction = this.handleNext;
        break;
      case 3:
        buttonText = this.props.t('startDemo');
        this.props.RootStore.commonStore.finishOnboard();
        buttonAction = this.directToHome;
        break;
      default:
        buttonText = this.props.t('next');
    }

    const finalButtonDisabled = (activeOnboardStep === 3 && !this.props.RootStore.commonStore.isWalletSetupDone);
    const activeStep = activeOnboardStep - 1;
    return (
      <React.Fragment>
        <div className={classes.header}>{tutorialSteps[activeStep].label}</div>
        <div className={classes.text}>
          {tutorialSteps[activeStep].text && tutorialSteps[activeStep].text }
          {tutorialSteps[activeStep].list && <CheckList list={tutorialSteps[activeStep].list} network={this.props.RootStore.commonStore.getCurrentNetwork()} /> }
        </div>
        <div className={classes.buttonContainer}>
          <BlueButton handleClick={buttonAction} buttonText={buttonText} disabled={finalButtonDisabled} />
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

export default withRouter(translate('general')(withStyles(styles)(OnboardStepper)));
