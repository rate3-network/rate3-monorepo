import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { observer, inject } from 'mobx-react';
import { inputBorderGrey, identityBlue, homeBg, backdropColor, modalShadow, homeTextGreyVerifier, materialGrey, buttonTextGrey } from '../constants/colors';
import BlueButton from './BlueButton';

const styles = (theme) => {
  return ({
    modal: {
      position: 'absolute',
      top: 'calc(50% - 10em)',
      left: 'calc(50% - 17.5em)',
      width: '35rem',
      height: '20rem',
      '&:focus': {
        outline: 'none',
      },
    },
    paper: {
      width: '100%',
      height: '100%',
      backgroundColor: identityBlue,
      boxShadow: modalShadow,
      borderRadius: '0.5em',
      display: 'flex',
      justifyContent: 'center',
    },
    content: {
      // color: 'white',
      width: '70%',
      height: 'calc(100% - 2em)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2em 2em 2em 2em',
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
      position: 'absolute',
      bottom: '1.5em',
    },
    buttonRoot: {
      backgroundColor: 'white',
      color: identityBlue,
      '&:hover': {
        backgroundColor: 'white',
        color: identityBlue,
      },
    },
  });
};


const InfoModal = inject('RootStore')(observer((props) => {
  const { classes } = props;
  return (
    <Modal
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={props.RootStore.modalStore.infoModalIsShowing}
      onClose={props.RootStore.modalStore.closeInfoModal.bind(props.RootStore.modalStore)}
      BackdropProps={{
        classes: {
          root: classes.backdrop,
        },
      }}
    >
      <div className={classes.modal}>
        <div className={classes.paper}>
          <div className={classes.content}>
            <h1>Success!</h1>
            <p>{props.RootStore.modalStore.infoModalText}. Please Click OK to refresh the page.</p>
            <div className={classes.buttonContainer}>
              <BlueButton
                classes={{
                  root: classes.buttonRoot,
                }}
                handleClick={props.RootStore.modalStore.closeInfoModal.bind(props.RootStore.modalStore)}
                buttonText="Ok"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}));

InfoModal.propTypes = {
  
};

export default withStyles(styles)(InfoModal);
