import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';

const styles = theme => ({
  button: {
    width: '13rem',
    height: '3.2rem',
    fontSize: '1.5em',
    fontWeight: 'bold',
    borderRadius: '50px',
    color: 'white',
    boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.1)',
  },
});

const BlueButton = (props) => {
  const { classes } = props;
  return (
    <Button
      variant="contained"
      size="large"
      color="primary"
      disabled={props.disabled}
      className={classes.button}
      onClick={props.handleClick}
    >
      {props.buttonText}
    </Button>
  );
};

BlueButton.propTypes = {
  classes: PropTypes.object.isRequired,
  // theme: PropTypes.object.isRequired,
};


export default withStyles(styles)(BlueButton);
