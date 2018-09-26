import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Modal from '@material-ui/core/Modal';
import { observer, inject } from 'mobx-react';
import { inputBorderGrey, identityBlue, homeBg, backdropColor, modalShadow, homeTextGreyVerifier, materialGrey, buttonTextGrey } from '../constants/colors';
import BlueButton from './BlueButton';

const styles = (theme) => {
  return ({
    modal: {
      position: 'absolute',
      top: 'calc(50% - 15em)',
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
      width: '90%',
      height: 'calc(100% - 4em)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4em 2em 2em 2em',
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
      paddingTop: '2em',
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
    text: {
      color: 'white',
      paddingTop: '1.5em',
      marginBlockEnd: '0em',
    },
  });
};


const LoadingModal = inject('RootStore')(observer((props) => {
  const { classes } = props;
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
            <CircularProgress className={classes.spinner} size={100} />
            <h2 className={classes.text} >{props.children}</h2>
            <p>{props.subText}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}));

LoadingModal.propTypes = {
  
};

export default withStyles(styles)(LoadingModal);
