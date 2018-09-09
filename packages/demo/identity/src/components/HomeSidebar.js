import React from 'react';
import PropTypes from 'prop-types';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import classNames from 'classnames';

import { sidebarShadow, homeSidebarBgColorUser, homeSidebarBgColorVerifier, homeTextGreyUser, homeTextWhiteVerifier } from './../constants/colors';
import NetworkBox from './NetworkBox';
import RoleSwitch from './RoleSwitch';
import ProfilePic from './ProfilePic';
import LanguageDropdown from './LanguageDropdown';

const styles = theme => ({
  rootStyle: {
    fontFamily: 'Roboto',
    // overflow: 'hidden',
  },
  rootStyleUser: {
    color: homeTextGreyUser,
  },
  rootStyleVerifier: {
    color: homeTextWhiteVerifier,
  },
  drawerPaper: {
    position: 'relative',
    width: '20rem',
    height: '100vh',
    boxShadow: sidebarShadow,
    transition: 'background-color 0.5s ease-in-out',
  },
  drawerPaperUser: {
    backgroundColor: homeSidebarBgColorUser,
  },
  drawerPaperVerifier: {
    backgroundColor: homeSidebarBgColorVerifier,
  },
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '1.5em 1em 2em 1.5em',
    overflow: 'auto',
    // color:
  },
  profilePic: {
    paddingTop: '3.5rem',
  },
  userInfo: {
    paddingTop: '3rem',
  },
  networkBox: {
    paddingTop: '1rem',
  },
  roleSwitch: {
    paddingTop: '3rem',
  },
  keys: {
    alignSelf: 'flex-start',
    paddingTop: '6rem',
  },
  bottomItems: {
    width: '100%',
    justifySelf: 'flex-end',
    paddingTop: '5rem',
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontWeight: '500',
    lineHeight: '1.1em',
  },
  keyName: {
    paddingTop: '1.2rem',
  },
  key: {
    fontWeight: 'bold',
    paddingTop: '0.1rem',
  },
  faqText: {
    fontWeight: 'bold',
    fontSize: '1.2em',
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
    <div className={classes.keys}>
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

const Faq = withStyles(styles)((props) => {
  const { classes } = props;
  return (
    <span className={classes.faqText}>
      FAQ
    </span>
  );
})
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
          classes.rootStyle,
          { [classes.rootStyleUser]: props.RootStore.commonStore.getIsUser() },
          { [classes.rootStyleVerifier]: !props.RootStore.commonStore.getIsUser() },
        ),
      }}
    >
      <div className={classes.container}>
        <TopText />
        <div className={classes.profilePic}><ProfilePic /></div>
        <div className={classes.userInfo}><UserInfo /></div>
        <div className={classes.networkBox}><NetworkBox /></div>
        <div className={classes.roleSwitch}>
          <RoleSwitch
            leftText="USER"
            rightText="VERIFIER"
            isUser={props.RootStore.commonStore.getIsUser()}
            onClick={props.RootStore.commonStore.toggleRole.bind(props.RootStore.commonStore)}
          />
        </div>
        <Keys />
        <div className={classes.bottomItems}><LanguageDropdown /><Faq /></div>
      </div>
    </Drawer>
  );
});

HomeSidebar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default inject('RootStore')(withStyles(styles, { withTheme: true })(HomeSidebar));
