import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import { observer, inject } from 'mobx-react';
import { errorModalBg, identityBlue, homeBg, backdropColor, modalShadow, homeTextGreyVerifier, materialGrey, buttonTextGrey } from '../constants/colors';

const styles = (theme) => {
  return ({
    modal: {
      position: 'absolute',
      top: 'calc(50% - 10em)',
      left: 'calc(50% - 15em)',
      width: '30rem',
      height: '20rem',
      '&:focus': {
        outline: 'none',
      },
    },
    paper: {
      width: '100%',
      height: '100%',
      backgroundColor: errorModalBg,
      boxShadow: modalShadow,
      borderRadius: '0.5em',
      display: 'flex',
      justifyContent: 'center',
    },
    content: {
      // color: 'white',
      width: '80%',
      height: 'calc(100% - 4em)',
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
      paddingTop: '1em',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {
      width: '100%',
      height: '100%',
      minHeight: '100%',
      fontSize: '1.5rem',
      borderRadius: '50px',
      color: 'white',
      '&:hover': {
        backgroundColor: 'white',
        color: errorModalBg,
      },
    },
    containedSecondary: {
      backgroundColor: 'white',
      color: errorModalBg,
      '&:hover': {
        backgroundColor: 'white',
        color: errorModalBg,
      },
    },
  });
};


const ErrorModal = inject('RootStore')(observer((props) => {
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
            <h1>ERROR</h1>
            <p>{props.errMsg}</p>
            <div className={classes.buttonContainer}>
              <Button onClick={() => { window.location.reload(); }} variant="contained" color="secondary" className={classes.button} classes={{ containedSecondary: classes.containedSecondary }}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}));

ErrorModal.propTypes = {
  errMsg: PropTypes.string,
};
ErrorModal.defaultProps = {
  errMsg: 'We have encountered an unknown error. Please refresh your page to restart the identity demonstration',
};

export default withStyles(styles)(ErrorModal);
