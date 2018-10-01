import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import { buttonShadow, buttonHoverShadow, outlineButtonRed } from '../constants/colors';

const styles = theme => ({
  button: {
    width: '100%',
    height: '100%',
    minHeight: '100%',
    fontSize: '1.5rem',
    // fontWeight: 'bold',
    border: `1px solid ${outlineButtonRed}`,
    borderRadius: '50px',
    color: outlineButtonRed,
    // boxShadow: buttonShadow,
    '&:hover': {
      boxShadow: buttonHoverShadow,
      backgroundColor: outlineButtonRed,
      color: 'white',
    },
  },
  whitespaces: {
    whiteSpace: 'pre',
  },
  root: {

  },
});

const OutlineButton = (props) => {
  let { classes } = props;
  return (
    <Button
      variant="outlined"
      size="large"
      color="secondary"
      className={classes.button}
      classes={{
        disabled: props.classes.disabled ? props.classes.disabled : classes.disabled,
        root: props.classes.root ? props.classes.root : classes.button,
      }}
      onClick={props.handleClick}
      style={{ fontWeight: props.fontWeight, fontSize: props.fontSize, lineHeight: props.lineHeight, letterSpacing: '0.05em' }}
    >
      {props.buttonText}
    </Button>
  );
};

OutlineButton.propTypes = {
  classes: PropTypes.object.isRequired,
  // theme: PropTypes.object.isRequired,
};


export default withStyles(styles)(OutlineButton);
