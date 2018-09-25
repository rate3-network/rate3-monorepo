import React from 'react';
import PropTypes from 'prop-types';
import { observer, inject, autorun } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import Slide from '@material-ui/core/Slide';
import { translate } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import RoleSelect from './RoleSelect';
import AccountTypeDropdown from './AccountTypeDropdown';
import BlueButton from './BlueButton';
import { identityBlue, materialGrey } from './../constants/colors';
import CheckList from './CheckList';

const animationDuration = 250;

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
    paddingTop: '8vh',
    alignSelf: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '13rem',
    height: '3.2rem',
    minHeight: '3.2rem',
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
  accountType: {
    paddingLeft: '0.5em',
  },
});

@inject('RootStore') @observer
class OnboardStepper extends React.Component {
  componentDidMount() {
    if (this.props.RootStore.commonStore.getIsUserOnboardDone() || this.props.RootStore.commonStore.getIsVerifierOnboardDone()) {
      console.log('should go to last step');
      this.props.RootStore.commonStore.goToLastOnboardStep();
    }
    // this.props.RootStore.commonStore.updateUserNetwork();
  }
  handleNext = () => {
    this.props.RootStore.commonStore.onboardNextStep();
  }

  directToHome = () => {
    this.props.history.push(this.props.RootStore.commonStore.getIsUser() ? '/user' : 'verifier');
    if (this.props.RootStore.commonStore.getIsUser()) {
      this.props.RootStore.commonStore.finishUserOnboard();
    } else {
      this.props.RootStore.commonStore.finishVerifierOnboard();
    }
  }

  render() {
    const onboardSteps = [
      {
        label: 'Cross-Chain Identity',
        text: 'A unified cross-chain identity framework for real-world entities to share identity information.',
      },
      {
        label: 'Who are you?',
        text: 'Your role determines your actions but don’t worry, for this demo you can change it at any time.',
        hasRoleSelect: true,
      },
      {
        hasAccountTypeDropdown: true,

        label: 'Set up Wallet',
        list: [{ value: 'Install Metamask on your browser' },
          { value: 'Sign in and unlock your metamask' },
          { value: 'Switch to a test network', hasStyledText: true },
          { value: 'Obtain some test ether' },
        ],

        listForFixedAccount: [
          { value: 'Using a buillt-in demo wallet' },
          { value: 'Test Network', hasStyledText: true },
        ],
      },
    ];
    
    const { classes, theme } = this.props;
    const maxSteps = onboardSteps.length;
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
        buttonAction = this.directToHome;
        break;
      default:
        buttonText = this.props.t('next');
    }
    const TransitionWrapper = (props) => {

      return (
        <Slide
          timeout={{
            enter: animationDuration,
            exit: animationDuration,
          }}
          in
          direction={props.direction}
        >
          {props.children}
        </Slide>
      );
    };

    const SetupWalletList = inject('RootStore')(observer((props) => {
      console.log('is on fixed account? : ', this.props.RootStore.userStore.isOnFixedAccount);
      if (this.props.RootStore.commonStore.getIsUser() && !this.props.RootStore.userStore.isOnFixedAccount) {
        
        return (
          <CheckList list={onboardSteps[activeStep].list} network={this.props.RootStore.currentNetwork} />
        );
      }
      return (
        <CheckList list={onboardSteps[activeStep].listForFixedAccount} network={this.props.RootStore.currentNetwork} />
      );
    }));
    const AccountTypeSelector = (props) => {
      return (<div className={classes.accountType}><AccountTypeDropdown variant={props.variant} /></div>);
    };
    const finalButtonDisabled = (activeOnboardStep === 3 && !this.props.RootStore.commonStore.isWalletSetupDone);
    const activeStep = activeOnboardStep - 1;
    return (
      <React.Fragment>
        {!this.props.RootStore.commonStore.getShouldRenderOnboardTransition() ?
          <TransitionWrapper direction="left">
            <div className={classes.header}>{onboardSteps[activeStep].label}</div>
          </TransitionWrapper> :
          <div className={classes.header}>{onboardSteps[activeStep].label}</div>
        }
        {!this.props.RootStore.commonStore.getShouldRenderOnboardTransition() ?
          <TransitionWrapper direction="left">
            <div className={classes.text}>
              {onboardSteps[activeStep].hasAccountTypeDropdown && <AccountTypeSelector variant={this.props.RootStore.commonStore.getIsUser() ? 'user' : 'verifier'} />}
              {onboardSteps[activeStep].text && onboardSteps[activeStep].text }
              {onboardSteps[activeStep].list && <SetupWalletList /> }
            </div>
          </TransitionWrapper> :
          <div className={classes.text}>
            {onboardSteps[activeStep].hasAccountTypeDropdown && <AccountTypeSelector variant={this.props.RootStore.commonStore.getIsUser() ? 'user' : 'verifier'} />}
            {onboardSteps[activeStep].text && onboardSteps[activeStep].text }
            {onboardSteps[activeStep].list && <SetupWalletList /> }
          </div>
        }
        {onboardSteps[activeStep].hasRoleSelect &&
          <RoleSelect
            leftText="User"
            rightText="Verifier"
            isUser={this.props.RootStore.commonStore.getIsUser()}
            handleUserClick={() => { this.props.RootStore.commonStore.changeToUser(); this.props.RootStore.initNetwork(); }}
            handleVerifierClick={() => { this.props.RootStore.commonStore.changeToVerifier(); this.props.RootStore.initNetwork(); }}
          />
        }
        <div className={classes.buttonContainer}>
          <BlueButton fontWeight="bold" handleClick={buttonAction} buttonText={buttonText} disabled={finalButtonDisabled} />
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

OnboardStepper.wrappedComponent.propTypes = {
  // classes: PropTypes.object.isRequired,
  // theme: PropTypes.object.isRequired,
  RootStore: PropTypes.object.isRequired,
};
OnboardStepper.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(translate('general')(withStyles(styles)(OnboardStepper)));
