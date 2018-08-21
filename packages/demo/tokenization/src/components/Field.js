import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classnames from 'classnames';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

import {
  textFieldLabel,
  textFieldFocused,
  textFieldInput,
  textFieldInputDisabled,
  textFieldShadow,
  textFieldBg,
  textFieldBgDisabled,
  textFieldBorder,
} from '../constants/colors';
import { genStyle, getClass } from '../utils';


const styles = theme => ({
  root: {
    '&:last-child $inputRoot': {
      marginBottom: 0,
    },
  },
  inputRoot: {
    padding: 0,
    marginBottom: theme.spacing.unit * 3,
    'label + &': {
      marginTop: theme.spacing.unit * 3,
    },
  },
  ...genStyle('inputNative', isUser => ({
    borderRadius: 9,
    backgroundColor: textFieldBg,
    color: textFieldInput,
    border: isUser ? 'none' : `1px solid ${textFieldBorder}`,
    fontSize: 16,
    padding: '10px 12px',
    width: 'calc(100% - 24px)',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:focus': {
      boxShadow: `inset 0px 3px 3px ${textFieldShadow}`,
    },
    '&:disabled': {
      backgroundColor: textFieldBgDisabled,
      color: textFieldInputDisabled,
    },
  })),
  inputWithAdornment: {
    paddingRight: 'calc(12px + 3em)',
  },
  inputLabel: {
    fontSize: '1em',
    color: textFieldLabel,
    letterSpacing: 0,
    transform: 'translate(0)',
  },
  inputLabelFocused: {
    color: `${textFieldFocused} !important`,
  },
  adornment: {
    padding: '10px',
    width: '3em',
    maxWidth: '3em',
    textAlign: 'center',
    color: textFieldLabel,
    marginLeft: 0,
    position: 'absolute',
    right: 0,
    '& p': {
      textTransform: 'uppercase',
      margin: 'auto',
      fontWeight: 'bold',
    },
  },
});

const Field = ({
  classes,
  isUser,
  label,
  adornment,
  type,
  ...props
}) => (
  <React.Fragment>
    <TextField
      label={label}
      InputProps={{
        disableUnderline: true,
        classes: {
          root: classes.inputRoot,
          input: classnames(
            getClass(classes, 'inputNative', isUser),
            { [classes.inputWithAdornment]: !!adornment },
          ),
        },
        type,
        endAdornment: adornment && (
          <InputAdornment
            position="end"
            classes={{
              root: classes.adornment,
            }}
          >
            {adornment}
          </InputAdornment>
        ),
      }}
      InputLabelProps={{
        shrink: true,
        className: classes.inputLabel,
        FormLabelClasses: {
          focused: classes.inputLabelFocused,
        },
      }}
      classes={{
        root: classes.root,
      }}
      {...props}
    />
  </React.Fragment>
);

Field.propTypes = {
  classes: PropTypes.object.isRequired,
  isUser: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  adornment: PropTypes.node,
  type: PropTypes.string,
};

Field.defaultProps = {
  adornment: null,
  type: 'text',
};

export default withStyles(styles, { withTheme: true })(Field);
