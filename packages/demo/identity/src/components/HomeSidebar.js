import React from 'react';
import PropTypes from 'prop-types';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import Info from '@material-ui/icons/InfoOutlined';
import { observer, inject } from 'mobx-react';
import classNames from 'classnames';
import { withRouter } from 'react-router-dom';

import { sidebarShadow, homeSidebarBgColorUser, homeSidebarBgColorVerifier, homeTextGreyUser, homeTextWhiteVerifier } from './../constants/colors';
import NetworkBox from './NetworkBox';
import NetworkDropdown from './NetworkDropdown';
import RoleSwitch from './RoleSwitch';
import ProfilePic from './ProfilePic';
import LanguageDropdown from './LanguageDropdown';
import AccountTypeDropdown from './AccountTypeDropdown';

const styles = theme => ({
  rootStyle: {
    // fontFamily: 'Roboto',
    // overflow: 'hidden',
  },
  rootStyleUser: {
    color: homeTextGreyUser,
  },
  rootStyleVerifier: {
    color: homeTextWhiteVerifier,
  },
  drawerPaper: {
    position: 'fixed',
    width: '20rem',
    height: '100vh',
    boxShadow: sidebarShadow,
    transition: 'background-color 0.1s ease',
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
    width: '6.3rem',
    height: '6.3rem',
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
    justifyContent: 'center',
  },
  topText: {
    fontSize: '1em',
    fontWeight: '300',
    alignSelf: 'flex-start',
    lineHeight: '0.9em',
    textDecoration: 'underline',

    width: '6em',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletNameText: {
    cursor: 'pointer',
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    whiteSpace: 'pre',
  },
  key: {
    fontWeight: 'bold',
    paddingTop: '0.1rem',
  },
  faqText: {
    fontWeight: 'bold',
    fontSize: '1.2em',
  },
  info: {
    fontSize: '1em',
  },
  accountTypeAndNetworkBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const TopText = inject('RootStore')(withRouter(withStyles(styles)((props) => {
  const { classes } = props;
  return (
    <div className={classes.topText}>
      <div style={{ cursor: 'pointer' }} onClick={() => { props.history.push(props.RootStore.commonStore.getIsUser() ? '/user/faq' : '/verifier/faq'); }}>
        FAQ
      </div>
      <div
        style={{ cursor: 'pointer' }}
        onClick={() => {
          if (props.RootStore.commonStore.getIsUser()) {
            props.RootStore.userStore.openModal();
          } else {
            props.RootStore.verifierStore.openModal();
          }
        }}
      >
        Help
      </div>
    </div>
  );
})));

const UserInfo = inject('RootStore')(observer(withStyles(styles)((props) => {
  const { classes } = props;
  const goToLink = () => {
    let addr;
    if (props.RootStore.commonStore.getIsUser()) {
      addr = props.RootStore.userStore.isOnFixedAccount ?
        props.RootStore.userStore.fixedUserAddr : props.RootStore.commonStore.metamaskAccount;
    } else {
      addr = '0xd102503E987a6402A1E0b220369ea4A4Bce911E8';
    }
    const link = `https://${props.RootStore.currentNetwork}.etherscan.io/address/${addr}`;
    window.open(link, '_blank');
  };
  return (
    <div>
      <div className={classes.userName}>
        {props.isUser ? 'USER' : 'VERIFIER'}
      </div>
      <div>
        <span className={classes.walletNameText} onClick={goToLink}>ETH wallet</span>
        :
        <span className={classes.amountText}> {props.balance} </span>
        <span className={classes.unitText}> ETH</span>
      </div>
    </div>
  );
})));


const Settings = inject('RootStore')(observer(withRouter(withStyles(styles)((props) => {
  const { classes } = props;
  return (
    <span style={{ cursor: 'pointer' }} onClick={() => { props.history.push(props.RootStore.commonStore.getIsUser() ? '/user/settings' : '/verifier/settings'); }} className={classes.faqText}>
      Settings
    </span>
  );
}))));


const HomeSidebar = inject('RootStore')(observer((props) => {
  const { classes } = props;
  return (
    <Drawer
      variant="permanent"
      // style={{ position: 'fixed' }}
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
        <div className={classes.profilePic}><ProfilePic size={11} /></div>
        <div className={classes.userInfo}>
          <UserInfo
            isUser={props.RootStore.commonStore.getIsUser()}
            balance={
              !props.RootStore.commonStore.getIsUser() ?
                props.RootStore.verifierStore.balanceToShow :
              props.RootStore.userStore.isOnFixedAccount ? props.RootStore.commonStore.fixedAccountBalance : props.RootStore.commonStore.metamaskBalance
            }
          />
        </div>
        <div className={classes.networkBox}>
          {props.RootStore.commonStore.shouldUseCommonNetwork ?
            <div className={classes.accountTypeAndNetworkBox}>
              <AccountTypeDropdown variant={props.RootStore.commonStore.getIsUser() ? 'user' : 'verifier'} isOnSidebar isUser={props.RootStore.commonStore.getIsUser()} />
              <NetworkDropdown buttonText="text" isOnSidebar isUser={props.RootStore.commonStore.getIsUser()} />
            </div> :
            <div className={classes.accountTypeAndNetworkBox}>
              <AccountTypeDropdown variant={props.RootStore.commonStore.getIsUser() ? 'user' : 'verifier'} isOnSidebar isUser={props.RootStore.commonStore.getIsUser()} />
              <NetworkBox />
            </div>
            
          }
        </div>
        <div className={classes.roleSwitch}>
          <RoleSwitch
            leftText="USER"
            rightText="VERIFIER"
            isUser={props.RootStore.commonStore.getIsUser()}
            onClick={() => {
              props.RootStore.commonStore.toggleRole(); // Change role when click on switch
              props.RootStore.initNetwork();
              props.history.push(props.RootStore.commonStore.getIsUser() ? '/user' : '/verifier'); // Change routes when click on switch
              window.location.reload();
              }
            }
          />
        </div>
        {/* <Keys isUser={props.RootStore.commonStore.getIsUser()}/> */}
        <div className={classes.bottomItems}><Settings /></div>
      </div>
    </Drawer>
  );
}));

HomeSidebar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default inject('RootStore')(withStyles(styles, { withTheme: true })(withRouter(HomeSidebar)));
