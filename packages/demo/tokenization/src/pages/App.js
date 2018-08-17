import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Link,
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
import List from '@material-ui/core/List';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';

// Pages
import Approval from './approval';
import Tokenization from './tokenization';
import Transactions from './transactions';
import Wallet from './wallet';
import Withdrawal from './withdrawal';

// Constants
import {
  issuerMainBg,
  issuerNavBg,
  issuerNavEmphasisPrimary,
  issuerNavFooterBg,
  issuerNavFooterText,
  issuerNavPrimary,
  navBoxShadow,
  userMainBg,
  userNavBg,
  userNavEmphasisPrimary,
  userNavFooterBg,
  userNavFooterText,
  userNavPrimary,
  sgdrColor,
  sgdColor,
} from '../constants/colors';

// Components
import AccountBalance from '../components/sidebar/AccountBalance';
import AccountsSummary from '../components/sidebar/AccountsSummary';
import ListLinkItem from '../components/sidebar/ListLinkItem';
import MainContent from '../components/MainContent';
import Switch from '../components/sidebar/Switch';

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
    backgroundColor: isUser ? userMainBg : issuerMainBg,
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
    backgroundColor: isUser ? userNavBg : issuerNavBg,
    color: isUser ? userNavPrimary : issuerNavPrimary,
    borderRight: 'none',
    textAlign: 'center',
    boxShadow: isUser ? `1px 0 5px ${navBoxShadow}` : 'none',
  })),
  drawerLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  drawerPadding: {
    flexGrow: 1,
  },
  ...genStyle('drawerCircularProfile', isUser => ({
    width: `${drawerWidth / 2}px`,
    height: `${drawerWidth / 2}px`,
    borderRadius: `${drawerWidth / 4}px`,
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: isUser ? userNavEmphasisPrimary : issuerNavEmphasisPrimary,
  })),
  ...genStyle('drawerRole', isUser => ({
    textTransform: 'uppercase',
    fontSize: '2em',
    fontWeight: 'bold',
  })),
  ...genStyle('drawerFooter', isUser => ({
    width: '100%',
    boxSizing: 'border-box',
    padding: theme.spacing.unit * 2,
    textAlign: 'left',
    textTransform: 'uppercase',
    fontSize: '0.8em',
    color: isUser ? userNavFooterText : issuerNavFooterText,
    backgroundColor: isUser ? userNavFooterBg : issuerNavFooterBg,
  })),
  ...genStyle('main', isUser => ({
    flexGrow: 1,
    backgroundColor: isUser ? userMainBg : issuerMainBg,
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
});

class App extends React.Component {
  state = {
    mobileOpen: false,
  };

  componentDidMount() {
    const { networkInit } = this.props;
    networkInit();
  }

  componentDidUpdate(prevProps) {
    const { location, isUser, switchRole } = this.props;
    if (location !== prevProps.location
      && location.state && location.state.isUser !== isUser) {
      switchRole();
    }
  }

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  handleRoleSwitch = () => {
    const { switchRole, isUser, history } = this.props;
    if (isUser) {
      history.push({
        pathname: '/issuer/approval',
        state: { isUser: false },
      });
    } else {
      history.push({
        pathname: '/user/tokenization',
        state: { isUser: true },
      });
    }
    switchRole();
  };

  renderDrawer() {
    const { classes, t, isUser } = this.props;

    return (
      <React.Fragment>
        <div>
          <div className={getClass(classes, 'drawerCircularProfile', isUser)} />
        </div>
        <h1 className={getClass(classes, 'drawerRole', isUser)}>
          { isUser ? t('user') : t('issuer') }
        </h1>
        <Switch
          onChange={this.handleRoleSwitch}
          isUser={isUser}
          leftText={t('user')}
          rightText={t('issuer')}
        />
        <AccountsSummary>
          <AccountBalance
            currency={<span style={{ color: sgdrColor }}>SGDR</span>}
            name={t('ethWallet')}
            amount={10}
          />
          <AccountBalance
            currencySymbol="$"
            currency={<span style={{ color: sgdColor }}>SGD</span>}
            name={t('bankAccount')}
            amount={100}
          />
        </AccountsSummary>
        <List component="div">
          { isUser && (
            <ListLinkItem
              to={{ pathname: '/user/tokenization', state: { isUser: true } }}
              primary={t('tokenize')}
              isUser
            />
          )}
          { isUser && (
            <ListLinkItem
              to={{ pathname: '/user/withdrawal', state: { isUser: true } }}
              primary={t('withdraw')}
              isUser
            />
          )}
          { !isUser && (
            <ListLinkItem
              to={{ pathname: '/issuer/approval', state: { isUser: false } }}
              primary={t('approval')}
              isUser={false}
            />
          )}
          <ListLinkItem
            to={{ pathname: '/transactions', state: { isUser } }}
            primary={t('transactions')}
            isUser={isUser}
          />
        </List>
        <div className={classes.drawerPadding} />
        <div className={getClass(classes, 'drawerFooter', isUser)}>
          <Link to="/" className={classes.drawerLink}>
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
    } = this.props;
    const { mobileOpen } = this.state;

    return (
      <div className={classes.root}>
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
                exact
                path="/"
                component={() => (
                  <MainContent
                    title={t('walletSettings')}
                    component={Wallet}
                  />
                )}
              />
              <Route
                path="/user/tokenization"
                component={() => (
                  <MainContent
                    title={t('tokenize')}
                    component={Tokenization}
                  />
                )}
              />
              <Route
                path="/user/withdrawal"
                component={() => (
                  <MainContent
                    title={t('withdraw')}
                    component={Withdrawal}
                  />
                )}
              />
              <Route
                path="/issuer/approval"
                component={() => (
                  <MainContent
                    title={t('approval')}
                    component={Approval}
                  />
                )}
              />
              <Route
                path="/transactions"
                component={() => (
                  <MainContent
                    title={t('transactions')}
                    component={Transactions}
                  />
                )}
              />
            </RouterSwitch>
          </div>
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
  networkInit: PropTypes.func.isRequired,
  switchRole: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isUser: state.wallet.isUser,
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
