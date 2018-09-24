import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';


import { observer, inject } from 'mobx-react';
import { identityHeavyGrey, buttonShadow, identityBlue, homeBg, backdropColor, modalShadow, homeTextGreyVerifier, materialGrey, buttonTextGrey } from '../../constants/colors';
import BlueButton from '../BlueButton';

const styles = (theme) => {
  return ({
    modal: {
      position: 'absolute',
      top: 'calc(50% - 15em)',
      left: 'calc(50% - 17.5em)',
      width: '35rem',
      height: '30rem',
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
    },
    content: {
      // color: 'white',
      width: 'calc(100% - 4em)',
      height: 'calc(100% - 4em)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2em 2em 2em 2em',
      '& h1': {
        color: identityBlue,
        // marginBlockEnd: '0.1em',
      },
    },
    backdrop: {
      backgroundColor: backdropColor,
    },


    buttonContainer: {
      width: '50%',
      height: '3.5em',
      paddingTop: '1.5em',
    },
    buttonDisabled: {
      backgroundColor: `${buttonTextGrey} !important`,
      boxShadow: `${buttonShadow} !important`,
    },
    label: {
      width: '80%',
      color: materialGrey,
      fontWeight: 500,
      '& p': {
        alignSelf: 'flex-start',
        marginBlockStart: '0.1em',
        marginBlockEnd: '1.3em',
      },
    },
    text: {
      width: '80%',
      color: identityHeavyGrey,
      fontWeight: 'bold',
      fontSize: '1.1em',
      '& p': {
        alignSelf: 'flex-start',
        marginBlockStart: '0.1em',
        marginBlockEnd: '1.5em',
      },
    },
  });
};


const VerifyModal = inject('RootStore')(observer((props) => {
  const { classes } = props;
  return (
    <Modal
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={props.open}
      onClose={props.onClose}
      BackdropProps={{
        classes: {
          root: classes.backdrop,
        },
      }}
    >
      <div className={classes.modal}>
        <div className={classes.paper}>
          <div className={classes.content}>
            <h1>Verification</h1>
            {/* <div className={classes.label}><p>{props.RootStore.userStore.formType}</p></div> */}
            <div className={classes.label}><p>Data</p></div>
            <div className={classes.text}><p>{props.RootStore.verifierStore.currentVerification.value}</p></div>
            <div className={classes.label}><p>User Address</p></div>
            <div className={classes.text}><p>{props.RootStore.verifierStore.currentVerification.user}</p></div>
            <div className={classes.label}><p>Verifier Address</p></div>
            <div className={classes.text}><p>{props.RootStore.verifierStore.currentVerification.verifier}</p></div>
            <div className={classes.buttonContainer}>
              <BlueButton
                buttonText="Sign"
                handleClick={props.RootStore.verifierStore.approveCurrentVerification.bind(props.RootStore.verifierStore)}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}));

VerifyModal.propTypes = {
  
};

export default withStyles(styles)(VerifyModal);
