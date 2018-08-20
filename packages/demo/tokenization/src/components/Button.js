import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import {
  buttonBgPrimary,
  buttonTextPrimary,
  userbuttonText,
  issuerButtonText,
  buttonBg,
} from '../constants/colors';
import { genStyle, getClass } from '../utils';


const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
  root: {

  },
  ...genStyle('contained', isUser => ({
    boxShadow: 'none',
    border: isUser ? userbuttonText : issuerButtonText,
    backgroundColor: buttonBg,
    borderRadius: '1.2em',
    height: '2.4em',
    fontSize: '1.2em',
    '&:hover': {
      backgroundColor: 'inherit',
    },
    '&:focus': {
      boxShadow: 'inherit',
    },
    '&:active': {
      boxShadow: 'inherit',
    },
  })),
  ...genStyle('containedPrimary', isUser => ({
    boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: buttonBgPrimary,
    color: buttonTextPrimary,
    padding: '0 30px',
    minWidth: '120px',
    '&:hover': {
      backgroundColor: buttonBgPrimary,
    },
    '&:active': {
      backgroundColor: buttonBgPrimary,
    },
  })),
  ...genStyle('containedSecondary', isUser => ({

  })),
});

const CustomButton = ({
  classes,
  isUser,
  children,
  ...props
}) => (
  <Button
    variant="contained"
    className={classes.button}
    classes={{
      root: classes.root,
      contained: getClass(classes, 'contained', isUser),
      containedPrimary: getClass(classes, 'containedPrimary', isUser),
      containedSecondary: getClass(classes, 'containedSecondary', isUser),
    }}
    disableRipple
    disableFocusRipple
    disableTouchRipple
    {...props}
  >
    {children}
  </Button>
);

CustomButton.propTypes = {
  classes: PropTypes.object.isRequired,
  isUser: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]).isRequired,
};

export default withStyles(styles, { withTheme: true })(CustomButton);
