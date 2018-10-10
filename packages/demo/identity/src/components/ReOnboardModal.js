import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { observer, inject } from 'mobx-react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';

import { identityBlue, homeBg, backdropColor, modalShadow, materialGrey } from '../constants/colors';
import BlueButton from './BlueButton';
import BasicButton from './BasicButton';
import SelectedBox from '../assets/selectedBox.svg';
import UnselectedBox from '../assets/unselectedBox.svg';

const styles = (theme) => {
  return ({
    modal: {
      position: 'absolute',
      top: 'calc(50% - 13em)',
      left: 'calc(50% - 15em)',
      width: '30rem',
      height: '28rem',
      '&:focus': {
        outline: 'none',
      },
    },
    paper: {
      width: '100%',
      height: '100%',
      backgroundColor: homeBg,
      boxShadow: modalShadow,
      borderRadius: '0.5em',
      display: 'flex',
      justifyContent: 'center',
      // overflow: 'scroll',
    },
    content: {
      // color: 'white',
      width: '90%',
      height: 'calc(100% - 2em)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2em 2em 2em 1em',
      '& h1': {
        color: 'white',
      },
      '& p': {
        textAlign: 'center',
        color: 'white',
        fontSize: '1.2em',
        lineHeight: 'calc(1.2em * 1.05)',
        letterSpacing: '2%',
      },
    },
    backdrop: {
      backgroundColor: backdropColor,
    },
    buttonContainer: {
      width: '50%',
      height: '3.5em',
      paddingTop: '0.5em',
    },
    buttonRoot: {
      backgroundColor: 'white',
      color: identityBlue,
      '&:hover': {
        backgroundColor: 'white',
        color: identityBlue,
      },
    },
    spinner: {
      color: 'white',
    },
    identityBlue: {
      color: `${identityBlue} !important`,
    },
    text: {
      color: 'white',
      paddingTop: '1.5em',
      marginBlockEnd: '0em',
    },
    listItem: {
      padding: '0px 0px 0px 0px',
      margin: '0.5em 0em 0.5em 0em',
      alignItems: 'flex-start',
      color: materialGrey,
    },
    checkboxRoot: {
      display: 'flex',
      alignItems: 'flex-start',
    },
    checkboxIcon: {
      height: '1em',
    },
    buttons: {
      width: '70%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    individualButton: {
      width: '8em',
    },
  });
};

const LoadingModal = inject('RootStore')(observer((props) => {
  const cancelAndGoBackToFixed = () => {
    props.RootStore.userStore.changeToFixedAccount();
    props.RootStore.initNetwork();
    props.RootStore.closeReonboardModal();
  };
  const continueToMetamask = () => {
    props.RootStore.closeReonboardModal();
  };

  const { classes } = props;
  // const step = props.RootStore.commonStore.getActiveOnboardStep() - 1;
  return (
    <Modal
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={props.open}
      BackdropProps={{
        classes: {
          root: classes.backdrop,
        },
      }}
    >
      <div className={classes.modal}>
        <div className={classes.paper}>
          <div className={classes.content}>
            <h1 className={classes.identityBlue}>Set up Wallet</h1>
            <div className={classes.root}>
              <List>
                <ListItem dense className={classes.listItem}>
                  <Checkbox
                    checked={props.RootStore.commonStore.isMetamaskEnabled}
                    checkedIcon={<img src={SelectedBox} alt="finished" className={classes.checkboxIcon} />}
                    icon={<img src={UnselectedBox} alt="not finished" className={classes.checkboxIcon} />}
                    classes={{ root: classes.checkboxRoot }}
                    disableRipple
                  />
                  <div className={classes.listItemButton}>
                    Install Metamask on your browser
                  </div>
                </ListItem>
                <ListItem dense className={classes.listItem}>
                  <Checkbox
                    checked={props.RootStore.commonStore.isMetamaskSignedIn}
                    checkedIcon={<img src={SelectedBox} alt="finished" className={classes.checkboxIcon} />}
                    icon={<img src={UnselectedBox} alt="not finished" className={classes.checkboxIcon} />}
                    classes={{ root: classes.checkboxRoot }}
                    disableRipple
                  />
                  <div className={classes.listItemButton}>
                    Sign in and unlock your metamask
                  </div>
                </ListItem>
                <ListItem dense className={classes.listItem}>
                  <Checkbox
                    checked={props.RootStore.commonStore.isOnTestNet}
                    checkedIcon={<img src={SelectedBox} alt="finished" className={classes.checkboxIcon} />}
                    icon={<img src={UnselectedBox} alt="not finished" className={classes.checkboxIcon} />}
                    classes={{ root: classes.checkboxRoot }}
                    disableRipple
                  />
                  <div className={classes.listItemButton}>
                    Switch to a test network
                  </div>
                </ListItem>
                <ListItem dense className={classes.listItem}>
                  <Checkbox
                    checked={props.RootStore.commonStore.hasTestEther}
                    checkedIcon={<img src={SelectedBox} alt="finished" className={classes.checkboxIcon} />}
                    icon={<img src={UnselectedBox} alt="not finished" className={classes.checkboxIcon} />}
                    classes={{ root: classes.checkboxRoot }}
                    disableRipple
                  />
                  <div className={classes.listItemButton}>
                    Obtain some test ether
                  </div>
                </ListItem>
              </List>
            </div>
            <div className={classes.buttons}>
              <div className={classes.individualButton}><BasicButton handleClick={cancelAndGoBackToFixed} buttonText="Cancel" fontSize="0.9em" /></div>
              <div className={classes.individualButton}><BlueButton disabled={!props.RootStore.commonStore.isWalletSetupDone} handleClick={continueToMetamask} buttonText="Continue" fontSize="0.9em" /></div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}));

LoadingModal.propTypes = {
  
};

export default withStyles(styles)(LoadingModal);
