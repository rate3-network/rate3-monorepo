import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';

const styles = theme => ({
  button: {
    width: '17vw',
    height: '7vh',
    fontSize: '2em',
    fontWeight: 'bold',
    borderRadius: '50px',
    // backgroundColor: identityBlue,
    color: 'white',
    boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.1)',
  },
  colorInherit: {
    // backgroundColor: identityBlue,
    // color: identityBlue,
  },
});

const OnboardStepper = (props) => {
  const { classes } = props;
  return (
    <Button
      variant="contained"
      size="large"
      color="primary"
      className={classes.button}
      classes={{
        root: classes.colorInherit,
      }}
    >
      Begin
    </Button>
  );
};

OnboardStepper.propTypes = {
  classes: PropTypes.object.isRequired,
  // theme: PropTypes.object.isRequired,
};


export default withStyles(styles)(OnboardStepper);
