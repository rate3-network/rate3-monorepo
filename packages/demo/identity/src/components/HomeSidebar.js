import React from 'react';
import PropTypes from 'prop-types';
import Drawer from '@material-ui/core/Drawer';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import classNames from 'classnames';

import { identityBlue, sidebarShadow, homeSidebarBgColorUser, homeSidebarBgColorVerifier  } from './../constants/colors';
import NetworkBox from './NetworkBox';
import RoleSwitch from './RoleSwitch';
import ProfilePic from './ProfilePic';

const bodyStyle = {
  color: 'pink',
  fontFamily: 'Roboto',
  backgroundColor: 'pink',
  fontSize: '40px',
};

const styles = theme => ({
  drawerPaper: {
    // backgroundColor: theme.palette.primary.homeSidebarBgColor,
    position: 'relative',
    width: '20rem',
    height: '100vh',
    boxShadow: sidebarShadow,
  },
  drawerPaperUser: {
    backgroundColor: homeSidebarBgColorUser,
  },
  drawerPaperVerifier: {
    backgroundColor: homeSidebarBgColorVerifier,
  },
  container: {
    // fontFamily: theme.typography.fontFamily,
    // color: theme.typography.color,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5em 1em 2em 1.5em',
    overflow: 'scroll',
    // color:
  },
  topText: {
    fontSize: '0.8em',
    fontWeight: '500',
    alignSelf: 'flex-start',
    lineHeight: '0.9em',
    textDecoration: 'underline',
  },
  walletNameText: {
    fontSize: '0.95em',
    textDecoration: 'underline',
    letterSpacing: '0.05em',
  },
  amountText: {
    fontSize: '1em',
    fontWeight: 'bold',
    lineHeight: '1.1em',

  },
  unitText: {
    fontSize: '0.8em',
    fontWeight: 'bold',
    lineHeight: '1.1em',
  },
  userName: {
    fontSize: '2.5em',
    fontWeight: 'bold',
    lineHeight: '1.1em',
    letterSpacing: '0.05em',
    textAlign: 'center',
  },
  keyTitle: {
    fontSize: '1.5em',
    fontWeight: 'bold',
    lineHeight: '1.1em',
  },
  key: {
    fontWeight: 'bold',
  },
  keysContainer: {
    alignSelf: 'flex-start',
  },
});
 
const TopText = withStyles(styles)((props) => {
  const { classes } = props;
  return <div className={classes.topText}>Want to browswe identities?</div>;
});

const UserInfo = withStyles(styles)((props) => {
  const { classes } = props;
  return (
    <div>
      <div className={classes.userName}>
        USER
      </div>
      <div>
        <span className={classes.walletNameText}>ETH wallet</span>
        :
        <span className={classes.amountText}> 0.0003454 </span>
        <span className={classes.unitText}> ETH</span>
      </div>
    </div>
  );
});

const Keys = withStyles(styles)((props) => {
  const { classes } = props;
  return (
    <div className={classes.keysContainer}>
      <div className={classes.keyTitle}>
        My Public Keys
      </div>
      <div>
        <div className={classes.keyName}>Management Key</div>
        <div className={classes.key}>0xb423...b292</div>
        <div className={classes.keyName}> ETH</div>
        <div className={classes.key}>0xb423...b292</div>
      </div>
    </div>
  );
});

const HomeSidebar = observer((props) => {
  const { classes } = props;
  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: classNames(
          classes.drawerPaper,
          { [classes.drawerPaperUser]: props.RootStore.commonStore.getIsUser() },
          { [classes.drawerPaperVerifier]: !props.RootStore.commonStore.getIsUser() },
        ),
      }}
    >
      <div className={classes.container}>
        <TopText />
        <ProfilePic />
        <UserInfo />
        <NetworkBox />
        <RoleSwitch
          leftText="USER"
          rightText="VERIFIER"
          isUser={props.RootStore.commonStore.getIsUser()}
          onClick={props.RootStore.commonStore.toggleRole.bind(props.RootStore.commonStore)}
        />
        <Keys />
      </div>
    </Drawer>
  );
});

HomeSidebar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default inject('RootStore')(withStyles(styles, { withTheme: true })(HomeSidebar));
