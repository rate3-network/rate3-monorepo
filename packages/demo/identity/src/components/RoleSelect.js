import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ClassNames from 'classnames';

import { identityBlue } from '../constants/colors';

const animationDuration = '250ms';
const styles = theme => ({
  container: {
    width: '18rem',
    height: '4rem',
    // border: '1px solid red',
    transition: `color ${animationDuration} ease-out`,
  },
  buttonGroup: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    // border: '1px solid black',
  },
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
    fontWeight: '900',
    fontSize: '1.5rem',
    userSelect: 'none',
    transition: `color ${animationDuration} ease-in-out`,
    transition: `border ${animationDuration} ease-in-out`,
  },
  buttonActive: {
    color: identityBlue,
    border: `2px solid ${identityBlue}`,
  },
});

const ToggleButtons = (props) => {
  const { classes } = props;
  return (
    <div className={classes.container}>
      <div className={classes.buttonGroup}>
        <div
          onClick={props.handleUserClick} 
          className={ClassNames(classes.button, { [classes.buttonActive]: props.isUser })}
        >
          {props.leftText}
        </div>
        <div
          onClick={props.handleVerifierClick} 
          className={ClassNames(classes.button, { [classes.buttonActive]: !props.isUser })}
        >
          {props.rightText}
        </div>
      </div>
    </div>
  );
};


ToggleButtons.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ToggleButtons);
