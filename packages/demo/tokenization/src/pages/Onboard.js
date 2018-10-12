import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import Rate3Logo from '../components/Rate3Logo';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import {
  TokenizationIntro,
  RoleSelection,
  VerifyUserBankAccount,
  VerifyTrustDetails,
  SetUpUserWallet,
  SetUpTrusteeWallet,
} from './OnboardingSteps';

import { compose } from '../utils';
import {
  onboardContentBg,
  onboardAppBarBg,
  onboardAppBarText,
} from '../constants/colors';
import { userOnboarded, trusteeOnboarded } from '../constants/storageKeys';
import { tokenizePath, approvePath } from '../constants/urls';
import LanguageDropdown from './LanguageDropdown';

const styles = theme => ({
  root: {
    flexGrow: 1,
    position: 'fixed',
    height: '100vh',
    width: '100vw',
    backgroundColor: onboardContentBg,
    letterSpacing: 0,
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  logo: {
    flexGrow: 1,
    '& svg': {
      height: '2em',
    },
  },
  appBarRoot: {
    backgroundColor: onboardAppBarBg,
    color: onboardAppBarText,
  },
  buttonRoot: {
    fontWeight: 300,
  },
  menuItem: {
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  content: {
    margin: 'auto',
    maxWidth: '900px',
    padding: '1em',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  verticalSeparator: {
    borderLeft: `1px solid ${onboardAppBarText}`,
    width: 1,
    height: '2em',
    margin: '0 1em',
  },
});

class Onboard extends React.Component {
  componentDidMount() {
    const { history } = this.props;

    if (sessionStorage.getItem(userOnboarded)) {
      history.push({
        pathname: tokenizePath,
        state: { isUser: true },
      });
    } else if (sessionStorage.getItem(trusteeOnboarded)) {
      history.push({
        pathname: approvePath,
        state: { isUser: false },
      });
    }
  }

  handleComplete = (context) => {
    const { history } = this.props;
    if (context.isUser) {
      sessionStorage.setItem(userOnboarded, true);
      history.push({
        pathname: tokenizePath,
        state: { isUser: true },
      });
    } else {
      sessionStorage.setItem(trusteeOnboarded, true);
      history.push({
        pathname: approvePath,
        state: { isUser: false },
      });
    }
  }

  render() {
    const { classes, t } = this.props;

    return (
      <div className={classes.root}>
        <AppBar
          position="static"
          classes={{
            root: classes.appBarRoot,
          }}
        >
          <Toolbar>
            <div className={classes.logo}>
              <Rate3Logo />
            </div>
            <div className={classes.headerRight}>
              <div>{t('tokenizationDemo')}</div>
              <div className={classes.verticalSeparator} />
              <LanguageDropdown />
            </div>
          </Toolbar>
        </AppBar>
        <div className={classes.content}>
          <OnboardingFlow
            onComplete={this.handleComplete}
          >
            <TokenizationIntro />
            <RoleSelection />
            {
              ctx => (ctx.isUser
                ? (
                  <OnboardingFlow>
                    <VerifyUserBankAccount />
                    <SetUpUserWallet />
                  </OnboardingFlow>
                )
                : (
                  <OnboardingFlow>
                    <VerifyTrustDetails />
                    <SetUpTrusteeWallet />
                  </OnboardingFlow>
                )
              )
            }
          </OnboardingFlow>
        </div>
      </div>
    );
  }
}

Onboard.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
};

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  translate('navigator'),
  withRouter,
);

export default enhance(Onboard);
