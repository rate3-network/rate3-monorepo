import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import { observer, inject } from 'mobx-react';
import { inputBorderGrey, identityBlue, homeBg, backdropColor, modalShadow, homeTextGreyVerifier, searchBarShadow } from '../../constants/colors';
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
      borderRadius: '0.5em 0.5em 0 0',
    },
    content: {
      // color: 'white',
      width: 'calc(100% - 4em)',
      height: 'calc(100% - 4em)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2em 2em 2em 2em',
    },
    backdrop: {
      backgroundColor: backdropColor,
    },
    textField: {
      backgroundColor: 'white',
      width: '80%',
      height: '2.5em',
      marginTop: 0,
      marginBottom: 0,
      padding: '0px 0px 0px 0px',
      borderRadius: '0.5em',
      border: `0.08em solid ${inputBorderGrey}`,
    },
    inputRoot: {
      fontSize: '1.1rem',
      paddingLeft: '1em',
      color: homeTextGreyVerifier,
      letterSpacing: '0.03em',
      fontWeight: '500',
      '&::placeholder': {
        fontWeight: 'bold',
      },
    },
    selectContainer: {
      backgroundColor: 'white',
      width: '80%',
      height: '2.5em',
      marginTop: 0,
      marginBottom: 0,
      padding: '0px 0px 0px 0px',
      borderRadius: '0.5em',
      border: `0.08em solid ${inputBorderGrey}`,
      borderStyle: 'solid',
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
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    buttonContainer: {
      width: '50%',
      height: '3.5em',
    },
  });
};


const RegistrationModal = inject('RootStore')(observer((props) => {
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
            Registration
            <Input
              placeholder="Your Address"
              className={classes.textField}
              classes={{ input: classes.inputRoot }}
              disableUnderline
              fullWidth
              value={props.textInputValue}
              onChange={props.handleChange}
            />
            <div className={classes.selectContainer}>
              <FormControl className={classes.formControl}>
                <Select
                  className={classes.select}
                  value={props.verifier}
                  onChange={props.handleClick}
                  input={(
                    <Input disableUnderline />
                  )}
                  MenuProps={{
                    PaperProps: {
                      square: false,
                    },
                  }}
                  classes={{
                    selectMenu: classes.selectMenu,
                    icon: classes.selectIcon,
                    root: classes.inputRoot,
                    select: classes.select,
                  }}
                >
                  <MenuItem value="_placeholder_" disabled>
                    Choose a Verifier
                  </MenuItem>
                  {props.verifierList.map((lang) => {
                      return (
                        <MenuItem
                          key={lang}
                          value={lang}
                          classes={{
                            root: classes.itemRoot,
                            selected: classes.selectedItem,
                          }}
                        >
                          <div className={classes.itemText}>{lang}</div>
                        </MenuItem>
                      );
                    })
                  }
                </Select>
              </FormControl>
            </div>
            <div className={classes.buttonContainer}><BlueButton disabled={!props.textInputValue || props.verifier === '_placeholder_'} buttonText="Register" /></div>     
          </div>
        </div>
      </div>
    </Modal>
  );
}));

RegistrationModal.propTypes = {
  
};

export default withStyles(styles)(RegistrationModal);
