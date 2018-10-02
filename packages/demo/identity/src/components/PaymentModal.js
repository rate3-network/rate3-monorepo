import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';
import { observer, inject } from 'mobx-react';

import { inputBorderGrey, disabledInput, buttonShadow, identityBlue, homeBg, backdropColor, modalShadow, homeTextGreyVerifier, materialGrey, buttonTextGrey } from './../constants/colors';
import BlueButton from './BlueButton';
import BasicButton from './BasicButton';
import { parseFormType } from './../utils';
import Ether from '../assets/ether_grey.svg';

const styles = (theme) => {
  return ({
    modal: {
      position: 'absolute',
      top: 'calc(50% - 18em)',
      left: 'calc(50% - 16em)',
      width: '32rem',
      height: '36rem',
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
        marginBlockEnd: '0.1em',
      },
    },
    backdrop: {
      backgroundColor: backdropColor,
    },
    textField: {
      backgroundColor: 'white',
      width: '80%',
      height: '2.5em',
      minHeight: '2.5em',
      marginTop: 0,
      marginBottom: 0,
      padding: '0px 0px 0px 0px',
      borderRadius: '0.5em',
      border: `0.08em solid ${inputBorderGrey}`,
      '&:focus-within': {
        border: `0.1em solid ${identityBlue} !important`,
        borderRadius: '0.5em',
      },
    },
    disabledTextField: {
      backgroundColor: disabledInput,
      width: '80%',
      height: '2.5em',
      minHeight: '2.5em',
      marginTop: 0,
      marginBottom: 0,
      padding: '0px 0px 0px 0px',
      borderRadius: '0.5em',
      border: '0em solid transparent',
    },
    inputRoot: {
      fontSize: '1.1rem',
      paddingLeft: '1em',
      color: homeTextGreyVerifier,
      letterSpacing: '0.03em',
      border: '0.5em',
      fontWeight: '500',
      '&::placeholder': {
        fontWeight: 'bold',
      },
    },
    formControl: {
      width: '100%',
      height: '100%',
    },
    selectedItem: {
      backgroundColor: 'inherit',
      color: 'inherit',
    },
    select: {
      fontSize: '1.1rem',
      fontWeight: '500',
      height: '100%',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    buttonContainer: {
      width: '80%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      height: '2.7em',
      paddingTop: '2em',
    },
    individualButton: {
      width: '8.5em',
    },
    buttonDisabled: {
      backgroundColor: `${buttonTextGrey} !important`,
      boxShadow: `${buttonShadow} !important`,
    },
    inputLabel: {
      paddingTop: '1em',
      width: '80%',
      color: materialGrey,
      fontWeight: 500,
      '& p': {
        alignSelf: 'flex-start',
        marginBlockEnd: '0.5em',
        paddingLeft: '0.2em',
      },
    },
    adornment: {
      color: homeTextGreyVerifier,
      fontSize: 'inherit',
      letterSpacing: '0.03em',
      fontWeight: '500',
      paddingRight: '0.8em',
      paddingTop: '0.15em',
    },
    description: {
      width: '90%',
      fontSize: '1.2em',
      color: homeTextGreyVerifier,
      textAlign: 'center',
      letterSpacing: '0.04em',
      lineHeight: '1.5em',
      marginBlockEnd: '0.5em',
    },
    maxFee: {
      color: materialGrey,
      width: '80%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      '& p': {
        alignSelf: 'flex-start',
        marginBlockEnd: '0.5em',
        marginBlockStart: '0.5em',
        paddingLeft: '0.2em',
      },
    },
    ether: {
      height: '1em',
    },
  });
};


const PaymentModal = inject('RootStore')(observer((props) => {
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
            <h1>Publish Verification</h1>
            <p className={classes.description}>Confirm your gas payment to publish this verification on the blockchain</p>
            <div className={classes.inputLabel}><p>Gas Limit</p></div>
            <Input
              placeholder="Gas Limit"
              className={classes.disabledTextField}
              classes={{ disabled: classes.disabled, input: classes.inputRoot }}
              disableUnderline
              fullWidth
              disabled
              value="6000000"
              endAdornment={<InputAdornment className={classes.adornment} disableTypography position="end">UNITS</InputAdornment>}
            />
            <div className={classes.inputLabel}>
              <p>
                Gas Price
              </p>
            </div>
            <Input
              placeholder="Gas Price"
              className={classes.textField}
              classes={{ input: classes.inputRoot }}
              disableUnderline
              fullWidth
              type="number"
              value={props.textInputValue}
              onChange={props.handleChange}
              endAdornment={<InputAdornment className={classes.adornment} disableTypography position="end">GWEI</InputAdornment>}
            />
            <div className={classes.inputLabel}>
              <p>
                Max Fee
              </p>
            </div>
            <div className={classes.maxFee}>
              <img className={classes.ether} src={Ether} alt="" /><p>0.000000000003 ETH</p>
            </div>
            <div className={classes.buttonContainer}>
              <div className={classes.individualButton}>
                <BasicButton handleClick={props.RootStore.paymentStore.closePaymentModal.bind(props.RootStore.paymentStore)} buttonText="Cancel" fontSize="1em" />
              </div>
              <div className={classes.individualButton}>
                <BlueButton
                  fontSize="1em"
                  classes={{
                    disabled: classes.buttonDisabled,
                  }}
                  disabled={!props.RootStore.paymentStore.gasPrice}
                  buttonText="Confirm"
                  handleClick={props.RootStore.paymentStore.confirmAddClaim.bind(props.RootStore.paymentStore)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}));

PaymentModal.propTypes = {
  
};

export default withStyles(styles)(PaymentModal);
