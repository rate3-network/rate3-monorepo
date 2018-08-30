import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Link,
  Route,
  Switch as RouterSwitch,
  withRouter,
} from 'react-router-dom';
import { Trans, translate } from 'react-i18next';

import blockies from 'ethereum-blockies';
import Decimal from 'decimal.js-light';

// Material UI
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
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
  sgdColor,
  sgdrColor,
  trusteeMainBg,
  trusteeNavBg,
  trusteeNavEmphasisPrimary,
  trusteeNavFooterBg,
  trusteeNavFooterText,
  trusteeNavPrimary,
  userMainBg,
  userNavBg,
  userNavEmphasisPrimary,
  userNavFooterBg,
  userNavFooterText,
  userNavPrimary,
  globalSpinnerBg,
  globalSpinner,
} from '../constants/colors';
import {
  approvePath,
  faqPath,
  finalizePath,
  rootPath,
  tokenizePath,
  transactionsPath,
  walletSettingsPath,
  withdrawPath,
} from '../constants/urls';
import { userOnboarded, trusteeOnboarded } from '../constants/storageKeys';
import { sgdrDecimalPlaces, sgdDecimalPlaces, ethDecimalPlaces } from '../constants/defaults';

// Components
import Onboard from './Onboard';
import LanguageDropdown from './LanguageDropdown';
import AccountBalance from '../components/sidebar/AccountBalance';
import AccountsSummary from '../components/sidebar/AccountsSummary';
import ListLinkItem from '../components/sidebar/ListLinkItem';
import MainContent from '../components/MainContent';
import Switch from '../components/sidebar/Switch';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import {
  VerifyUserBankAccount,
  SetUpUserWallet,
  VerifyTrustDetails,
  SetUpTrusteeWallet,
  SwitchRoleIntro,
} from './OnboardingSteps';
import MaterialDesignSpinner from '../components/spinners/MaterialDesignSpinner';

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
  drawerHeader: {
    padding: theme.spacing.unit * 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',

  },
  drawerLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  drawerPadding: {
    flexGrow: 1,
  },
  ...genStyle('drawerCircularProfile', isUser => ({
    width: `${drawerWidth / 3}px`,
    height: `${drawerWidth / 3}px`,
    borderRadius: `${drawerWidth / 3}px`,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: isUser ? userNavEmphasisPrimary : trusteeNavEmphasisPrimary,
  })),
  ...genStyle('drawerRole', isUser => ({
    textTransform: 'uppercase',
    fontSize: '2em',
    fontWeight: 'bold',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
  })),
  ...genStyle('drawerBalance', isUser => ({
    fontSize: '0.9em',
    marginBottom: '1.5rem',
  })),
  ...genStyle('drawerFooter', isUser => ({
    width: '100%',
    boxSizing: 'border-box',
    padding: theme.spacing.unit * 2,
    textAlign: 'left',
    textTransform: 'uppercase',
    fontSize: '0.8em',
    color: isUser ? userNavFooterText : trusteeNavFooterText,
    backgroundColor: isUser ? userNavFooterBg : trusteeNavFooterBg,
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
  sgdCurrency: {
    color: sgdColor,
  },
  sgdrCurrency: {
    color: sgdrColor,
  },
  spinnerContainer: {
    position: 'fixed',
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    backgroundColor: globalSpinnerBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

  getAvailableTokenBalance() {
    const {
      currentTokenBalance,
      currentPendingWithdrawal,
    } = this.props;

    return (new Decimal(currentTokenBalance))
      .sub(new Decimal(currentPendingWithdrawal))
      .toFixed(sgdrDecimalPlaces);
  }

  getPendingTokenBalance() {
    const {
      currentPendingTokenization,
    } = this.props;
    const pendingDecimal = new Decimal(currentPendingTokenization);

    if (pendingDecimal.isZero()) {
      return null;
    }

    return pendingDecimal.toFixed(sgdrDecimalPlaces);
  }

  getAvailableBankBalance() {
    const {
      currentBankBalance,
      currentPendingTokenization,
    } = this.props;

    return (new Decimal(currentBankBalance))
      .sub(new Decimal(currentPendingTokenization))
      .toFixed(sgdDecimalPlaces);
  }

  getPendingBankBalance() {
    const {
      currentPendingWithdrawal,
    } = this.props;
    const pendingDecimal = new Decimal(currentPendingWithdrawal);

    if (pendingDecimal.isZero()) {
      return null;
    }

    return pendingDecimal.toFixed(sgdrDecimalPlaces);
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

  handleRoleSwitch = () => {
    const {
      switchRole,
      isUser,
      location: { pathname },
    } = this.props;

    // Don't change path if on shared pages
    const sharedPage = [
      transactionsPath,
      walletSettingsPath,
    ].reduce((isShared, path) => (isShared || path === pathname), false);
    if (sharedPage) {
      switchRole();
      return;
    }

    if (isUser) {
      this.switchToTrustee();
    } else {
      this.switchToUser();
    }
    switchRole();
  };

  switchToUser = () => {
    const { history } = this.props;
    history.push({
      pathname: tokenizePath,
      state: { isUser: true },
    });
  }

  switchToTrustee = () => {
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

  renderPendingValue = value => (
    <Trans i18nKey="pendingAmount">
      {''}
      {{ value }}
      pending
    </Trans>
  )

  renderDrawer() {
    const {
      classes,
      t,
      isUser,
      currentDefaultAccount,
      currentEthBalance,
      currentTokenBalance,
      currentBankBalance,
      currentPendingTokenization,
      currentPendingWithdrawal,
    } = this.props;

    return (
      <React.Fragment>
        <div className={classes.drawerHeader}>
          <Link to={faqPath} className={classes.drawerLink}>
            {t('faq')}
          </Link>
          <LanguageDropdown />
        </div>
        <div>
          <img
            className={getClass(classes, 'drawerCircularProfile', isUser)}
            src={
              blockies.create({
                seed: currentDefaultAccount,
                size: 8,
                scale: Math.ceil(drawerWidth / (3 * 8)),
              }).toDataURL()
            }
            alt=""
          />
        </div>
        <h1 className={getClass(classes, 'drawerRole', isUser)}>
          { isUser ? t('user') : t('trustee') }
        </h1>
        <div className={getClass(classes, 'drawerBalance', isUser)}>
          {t('ethWallet')}:{' '}
          <strong>
            {
              (new Decimal(currentEthBalance))
                .todp(ethDecimalPlaces, Decimal.ROUND_DOWN)
                .toString()
            }
            <small>&nbsp;ETH</small>
          </strong>
        </div>
        <Switch
          onChange={this.handleRoleSwitch}
          isUser={isUser}
          leftText={t('user')}
          rightText={t('trustee')}
        />
        <AccountsSummary>
          <AccountBalance
            currency="SGDR"
            name={isUser ? t('ethWallet') : t('circulatingTokens')}
            amount={currentTokenBalance}
            pendingAmount={(new Decimal(currentPendingTokenization)).isZero()
              ? null
              : currentPendingTokenization
            }
            renderPending={this.renderPendingValue}
            classes={{
              currency: classes.sgdrCurrency,
            }}
          />
          <AccountBalance
            currencySymbol="$"
            currency="SGD"
            name={isUser ? t('bankAccount') : t('trustBalance')}
            amount={currentBankBalance}
            pendingAmount={(new Decimal(currentPendingWithdrawal)).isZero()
              ? null
              : currentPendingWithdrawal
            }
            renderPending={this.renderPendingValue}
            classes={{
              currency: classes.sgdCurrency,
            }}
          />
        </AccountsSummary>
        <List component="div">
          { isUser && (
            <ListLinkItem
              to={{ pathname: tokenizePath, state: { isUser: true } }}
              primary={t('tokenize')}
              isUser
            />
          )}
          { isUser && (
            <ListLinkItem
              to={{ pathname: withdrawPath, state: { isUser: true } }}
              primary={t('withdraw')}
              isUser
            />
          )}
          { !isUser && (
            <ListLinkItem
              to={{ pathname: approvePath, state: { isUser: false } }}
              primary={t('approval')}
              isUser={false}
            />
          )}
          { !isUser && (
            <ListLinkItem
              to={{ pathname: finalizePath, state: { isUser: false } }}
              primary={t('finalizationOrRevocation')}
              isUser={false}
            />
          )}
          <ListLinkItem
            to={{ pathname: transactionsPath, state: { isUser } }}
            primary={t('transactions')}
            isUser={isUser}
          />
        </List>
        <div className={classes.drawerPadding} />
        <div className={getClass(classes, 'drawerFooter', isUser)}>
          <Link to={walletSettingsPath} className={classes.drawerLink}>
            {t('walletSettings')}
          </Link>
        </div>
      </React.Fragment>
    );
  }

  render() {
    const {
      classes,
      theme,
      t,
      isUser,
      accountLoading,
      location: { pathname },
      toRevoke,
    } = this.props;
    const { mobileOpen, modalOpen, modalOnboardUser } = this.state;

    if (pathname === rootPath) {
      return <Onboard />;
    }

    return (
      <div className={classes.root}>
        {accountLoading && (
          <div className={classes.spinnerContainer}>
            <MaterialDesignSpinner
              size={300}
              margin={10}
              border={30}
              color={globalSpinner}
            />
          </div>
        )}
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
            {this.renderDrawer()}
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
            {this.renderDrawer()}
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
  accountLoading: PropTypes.bool.isRequired,
  currentDefaultAccount: PropTypes.string.isRequired,
  currentEthBalance: PropTypes.string.isRequired,
  currentTokenBalance: PropTypes.string.isRequired,
  currentBankBalance: PropTypes.string.isRequired,
  currentPendingTokenization: PropTypes.string.isRequired,
  currentPendingWithdrawal: PropTypes.string.isRequired,
  toRevoke: PropTypes.bool.isRequired,
  networkInit: PropTypes.func.isRequired,
  switchRole: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isUser: state.wallet.isUser,
  accountLoading: state.wallet.walletLoading
    || state.wallet.balancesLoading
    || state.network.contractsLoading,
  currentDefaultAccount: state.wallet.currentDefaultAccount,
  currentEthBalance: state.wallet.currentEthBalance,
  currentTokenBalance: state.wallet.currentTokenBalance,
  currentBankBalance: state.wallet.currentBankBalance,
  currentPendingTokenization: state.wallet.currentPendingTokenization,
  currentPendingWithdrawal: state.wallet.currentPendingWithdrawal,
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
