import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import {
  buttonBgPrimary,
  buttonBgPrimaryHover,
  buttonTextPrimary,
  buttonTextPrimaryHover,
  buttonShadowPrimary,
  buttonShadowPrimaryHover,
  buttonShadowPrimaryActive,
  buttonBorderPrimary,
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
    transition: 'none',
  },
  ...genStyle('contained', isUser => ({
    boxShadow: 'none',
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
    boxShadow: `4px 4px 10px ${buttonShadowPrimary}`,
    border: '3px solid transparent',
    backgroundColor: buttonBgPrimary,
    color: buttonTextPrimary,
    padding: '0 30px',
    minWidth: '120px',
    '&:hover': {
      boxShadow: `4px 4px 10px ${buttonShadowPrimaryHover}`,
      border: `3px solid ${buttonBorderPrimary}`,
      backgroundColor: buttonBgPrimaryHover,
      color: buttonTextPrimaryHover,
    },
    '&:active': {
      boxShadow: `4px 4px 10px ${buttonShadowPrimaryActive}`,
      border: `3px solid ${buttonBorderPrimary}`,
      backgroundColor: buttonBgPrimaryHover,
      color: buttonTextPrimaryHover,
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
