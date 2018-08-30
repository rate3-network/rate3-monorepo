import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Route,
  Switch as RouterSwitch,
  withRouter,
} from 'react-router-dom';
import { translate } from 'react-i18next';

// Material UI
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Modal from '@material-ui/core/Modal';

// Pages
import Approval from './Approval';
import Finalization from './Finalization';
import Tokenization from './Tokenization';
import Transactions from './Transactions';
import Wallet from './Wallet';
import Withdrawal from './Withdrawal';

// Constants
import {
  navBoxShadow,
  onboardingModalShadow,
  onboardingModalTrusteeBackdrop,
  onboardingModalUserBackdrop,
  trusteeMainBg,
  trusteeNavBg,
  trusteeNavPrimary,
  userMainBg,
  userNavBg,
  userNavPrimary,
} from '../constants/colors';
import {
  approvePath,
  finalizePath,
  rootPath,
  tokenizePath,
  transactionsPath,
  walletSettingsPath,
  withdrawPath,
} from '../constants/urls';
import { userOnboarded, trusteeOnboarded } from '../constants/storageKeys';

// Components
import SpinnerOverlay from './_SpinnerOverlay';
import Sidebar from './_Sidebar';
import Onboard from './Onboard';
import MainContent from '../components/MainContent';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import {
  VerifyUserBankAccount,
  SetUpUserWallet,
  VerifyTrustDetails,
  SetUpTrusteeWallet,
  SwitchRoleIntro,
} from './OnboardingSteps';

// Actions
import {
  init as initAction,
} from '../actions/Network';
import {
  switchRole as switchRoleAction,
} from '../actions/Wallet';

// Utilities
import { compose, genStyle, getClass } from '../utils';

const drawerWidth = 320;

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: 430,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
  },
  ...genStyle('appBar', isUser => ({
    position: 'absolute',
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
    backgroundColor: isUser ? userMainBg : trusteeMainBg,
  })),
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  ...genStyle('drawerPaper', isUser => ({
    width: drawerWidth,
    [theme.breakpoints.up('md')]: {
      position: 'relative',
    },
    backgroundColor: isUser ? userNavBg : trusteeNavBg,
    color: isUser ? userNavPrimary : trusteeNavPrimary,
    borderRight: 'none',
    textAlign: 'center',
    boxShadow: isUser ? `1px 0 5px ${navBoxShadow}` : 'none',
  })),
  ...genStyle('main', isUser => ({
    flexGrow: 1,
    backgroundColor: isUser ? userMainBg : trusteeMainBg,
    overflowY: 'auto',
  })),
  content: {
    padding: theme.spacing.unit * 8,
  },
  '@media (max-width: 959.95px)': {
    content: {
      padding: theme.spacing.unit * 2,
    },
  },
  ...genStyle('modalBackdropRoot', isUser => ({
    backgroundColor: isUser
      ? onboardingModalUserBackdrop : onboardingModalTrusteeBackdrop,
  })),
  modalRoot: {
    display: 'flex',
    overflowY: 'auto',
  },
  modalContentRoot: {
    margin: 'auto',
    maxWidth: '600px',
    width: '600px',
    borderRadius: '10px',
    overflow: 'hidden',
    letterSpacing: 0,
    boxShadow: `4px 4px 20px ${onboardingModalShadow}`,
    '&:focus': {
      outline: 'none',
    },
  },
});

class App extends React.Component {
  state = {
    mobileOpen: false,
    modalOpen: false,
    modalOnboardUser: false,
  };

  componentDidMount() {
    const {
      networkInit,
      location: { pathname },
    } = this.props;
    const isTrusteePath = [
      approvePath,
      finalizePath,
    ].reduce((isTrustee, path) => (isTrustee || path === pathname), false);
    networkInit(!isTrusteePath);
  }

  componentWillReceiveProps(nextProps) {
    this.checkOnboarded(nextProps.isUser);
  }

  componentDidUpdate(prevProps) {
    const {
      location,
      isUser,
      switchRole,
    } = this.props;

    if (location !== prevProps.location
      && location.state && location.state.isUser !== isUser) {
      switchRole();
    }
  }

  handleModalClose = isUser => () => {
    if (isUser) {
      sessionStorage.setItem(userOnboarded, true);
    } else {
      sessionStorage.setItem(trusteeOnboarded, true);
    }
    this.setState({ modalOpen: false });
  }

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  switchRoleWithoutRedirect = () => {
    const {
      location: { pathname },
      switchRole,
    } = this.props;

    // Don't change path if on shared pages
    const sharedPage = [
      transactionsPath,
      walletSettingsPath,
    ].reduce((isShared, path) => (isShared || path === pathname), false);
    if (sharedPage) {
      switchRole();
      return true;
    }

    return false;
  }

  switchToUser = () => {
    if (this.switchRoleWithoutRedirect()) {
      return;
    }
    const { history } = this.props;
    history.push({
      pathname: tokenizePath,
      state: { isUser: true },
    });
  }

  switchToTrustee = () => {
    if (this.switchRoleWithoutRedirect()) {
      return;
    }
    const { history } = this.props;
    history.push({
      pathname: approvePath,
      state: { isUser: false },
    });
  }

  checkOnboarded(isUser) {
    const { modalOpen } = this.state;

    if (isUser) {
      if (sessionStorage.getItem(userOnboarded)) {
        modalOpen && this.setState({ modalOpen: false });
      } else {
        this.setState({ modalOpen: true, modalOnboardUser: true });
      }
    } else if (sessionStorage.getItem(trusteeOnboarded)) {
      modalOpen && this.setState({ modalOpen: false });
    } else {
      this.setState({ modalOpen: true, modalOnboardUser: false });
    }
  }

  render() {
    const {
      classes,
      theme,
      t,
      isUser,
      location: { pathname },
      toRevoke,
    } = this.props;
    const { mobileOpen, modalOpen, modalOnboardUser } = this.state;

    if (pathname === rootPath) {
      return <Onboard />;
    }

    return (
      <div className={classes.root}>
        <SpinnerOverlay />
        <Hidden mdUp implementation="css">
          <AppBar
            className={getClass(classes, 'appBar', isUser)}
            elevation={0}
          >
            <Toolbar disableGutters>
              <IconButton
                color="default"
                aria-label="Open drawer"
                onClick={this.handleDrawerToggle}
                className={classes.navIconHide}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={this.handleDrawerToggle}
            classes={{
              paper: getClass(classes, 'drawerPaper', isUser),
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <Sidebar
              switchToUser={this.switchToUser}
              switchToTrustee={this.switchToTrustee}
            />
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            open
            classes={{
              paper: getClass(classes, 'drawerPaper', isUser),
            }}
          >
            <Sidebar
              switchToUser={this.switchToUser}
              switchToTrustee={this.switchToTrustee}
            />
          </Drawer>
        </Hidden>
        <main className={getClass(classes, 'main', isUser)}>
          <Hidden mdUp implementation="css">
            <div className={classes.toolbar} />
          </Hidden>
          <div className={classes.content}>
            <RouterSwitch>
              <Route
                path={walletSettingsPath}
                component={() => (
                  <MainContent
                    title={t('walletSettings')}
                    component={Wallet}
                  />
                )}
              />
              <Route
                path={tokenizePath}
                component={() => (
                  <MainContent
                    title={t('tokenize')}
                    component={Tokenization}
                  />
                )}
              />
              <Route
                path={withdrawPath}
                component={() => (
                  <MainContent
                    title={t('withdraw')}
                    component={Withdrawal}
                  />
                )}
              />
              <Route
                path={approvePath}
                component={() => (
                  <MainContent
                    title={t('approval')}
                    component={Approval}
                  />
                )}
              />
              <Route
                path={finalizePath}
                component={() => (
                  <MainContent
                    title={toRevoke ? t('revocation') : t('finalization')}
                    component={Finalization}
                  />
                )}
              />
              <Route
                path={transactionsPath}
                component={() => (
                  <MainContent
                    title={t('transactions')}
                    component={Transactions}
                  />
                )}
              />
            </RouterSwitch>
          </div>
          <Modal
            aria-labelledby="onboarding"
            aria-describedby="onboarding"
            open={modalOpen}
            BackdropProps={{
              classes: {
                root: getClass(classes, 'modalBackdropRoot', isUser),
              },
            }}
            classes={{
              root: classes.modalRoot,
            }}
            disableBackdropClick
            disableEscapeKeyDown
          >
            <div className={classes.modalContentRoot}>
              {modalOnboardUser
                ? (
                  <OnboardingFlow
                    onComplete={this.handleModalClose(modalOnboardUser)}
                  >
                    <SwitchRoleIntro
                      isUser={modalOnboardUser}
                      handleBackToPrevRole={this.switchToTrustee}
                    />
                    <VerifyUserBankAccount isModal />
                    <SetUpUserWallet isModal />
                  </OnboardingFlow>
                )
                : (
                  <OnboardingFlow
                    onComplete={this.handleModalClose(modalOnboardUser)}
                  >
                    <SwitchRoleIntro
                      isUser={modalOnboardUser}
                      handleBackToPrevRole={this.switchToUser}
                    />
                    <VerifyTrustDetails isModal />
                    <SetUpTrusteeWallet isModal />
                  </OnboardingFlow>
                )
              }
            </div>
          </Modal>
        </main>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // translate prop passed in from translate HOC
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    state: PropTypes.object,
  }).isRequired,
  isUser: PropTypes.bool.isRequired,
  toRevoke: PropTypes.bool.isRequired,
  networkInit: PropTypes.func.isRequired,
  switchRole: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isUser: state.wallet.isUser,
  toRevoke: state.finalize.toRevoke,
});

const enhance = compose(
  withStyles(styles, { withTheme: true }),
  withRouter,
  translate('navigator'),
  connect(
    mapStateToProps,
    {
      networkInit: initAction,
      switchRole: switchRoleAction,
    },
  ),
);

export default enhance(App);
