import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Link } from 'react-router-dom';
import { translate } from 'react-i18next';

import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
import MenuIcon from '@material-ui/icons/Menu';
import {
  List,
  Collapse,
  Divider,
} from '@material-ui/core';

import Wallet from './wallet';
import Tokenization from './tokenization';
import Withdrawal from './withdrawal';

import rate3Logo from '../assets/rate3.png';
import {
  sidebarBg,
  sidebarSecondaryText,
} from '../constants/colors';
import ListChildLinkItem from '../components/sidebar/ListChildLinkItem';
import ListParentItem from '../components/sidebar/ListParentItem';

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
  appBar: {
    position: 'absolute',
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
    backgroundColor: 'transparent',
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
    [theme.breakpoints.up('md')]: {
      position: 'relative',
    },
    backgroundColor: sidebarBg,
    color: sidebarSecondaryText,
  },
  drawerLogo: {
    width: '50%',
    objectFit: 'contain',
    marginTop: theme.spacing.unit * 2,
  },
  drawerDivider: {
    backgroundColor: sidebarSecondaryText,
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 3,
  },
  drawerLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  drawerNav: {
    width: '100%',
    textAlign: 'center',
  },
  main: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
  },
  content: {
    padding: theme.spacing.unit * 2,
  },
});

class App extends React.Component {
  state = {
    mobileOpen: false,
    activitiesOpen: false,
  };

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  handleActivitiesClick = () => {
    this.setState(state => ({ activitiesOpen: !state.activitiesOpen }));
  };

  renderDrawer() {
    const { classes, t } = this.props;
    const { activitiesOpen } = this.state;

    return (
      <React.Fragment>
        <div className={classes.drawerNav}>
          <img className={classes.drawerLogo} src={rate3Logo} alt="rate3 logo" />
          <div>{t('tokenizationDemo')}</div>
          <div>
            <Link to="/" className={classes.drawerLink}>
              {t('walletSettings')}
            </Link>
          </div>
          <Divider className={classes.drawerDivider} />
          <List component="nav">
            <ListParentItem
              primary={t('activities')}
              isOpen={activitiesOpen}
              onClick={this.handleActivitiesClick}
            />
            <Collapse in={activitiesOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListChildLinkItem to="/tokenization" primary={t('tokenize')} />
                <ListChildLinkItem to="/withdrawal" primary={t('withdraw')} />
              </List>
            </Collapse>
          </List>
        </div>
      </React.Fragment>
    );
  }

  render() {
    const { classes, theme } = this.props;
    const { mobileOpen } = this.state;

    return (
      <div className={classes.root}>
        <AppBar
          className={classes.appBar}
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
        <Hidden mdUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={this.handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
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
              paper: classes.drawerPaper,
            }}
          >
            {this.renderDrawer()}
          </Drawer>
        </Hidden>
        <main className={classes.main}>
          <Hidden mdUp implementation="css">
            <div className={classes.toolbar} />
          </Hidden>
          <div className={classes.content}>
            <Switch>
              <Route exact path="/" component={Wallet} />
              <Route path="/tokenization" component={Tokenization} />
              <Route path="/withdrawal" component={Withdrawal} />
            </Switch>
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
};

export default withStyles(styles, { withTheme: true })(translate('navigator')(App));
