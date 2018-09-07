import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { observer, inject } from 'mobx-react';

import { toggleButtonBg, toggleGrey, identityBlue, buttonTextGrey } from '../constants/colors';

const animationDuration = '250ms';
const baseWidth = 16;

const styles = (theme) => {
  return {
    switchWrapper: {
      transition: `background-color ${animationDuration} ease-out`,
    },
    switch: {
      position: 'relative',
      width: `${baseWidth}em`,
      height: `${baseWidth / 5.35}em`,
      borderRadius: '2%',
      transition: `background-color ${animationDuration} ease-out`,
      zIndex: 1,
      boxShadow: 'inset 0 0 9px rgba(0, 0, 0, 0.2)',
      '&:before': {
        content: '',
        position: 'absolute',
        top: 0,
        backgroundColor: 'inherit',
        borderRadius: '50%',
        zIndex: 2,
        left: '-0.25em',
      },
      '&:after': {
        right: '-0.25em',
      },
    },
    switchIsOff: {
      backgroundColor: toggleGrey,
    },
    switchIsOn: {
      backgroundColor: toggleGrey,
    },
    toggleButton: {
      position: 'absolute',
      width: '50%',
      borderRadius: '2%',
      height: `${baseWidth / 5.35}em`,
      backgroundColor: toggleButtonBg,
      borderRadius: '0%',
      transition: `transform ${animationDuration} ease-in-out`,
      zIndex: '3',
      boxShadow: '1px 0 6px rgba(0, 0, 0, 0.2)',
    },
    toggleButtonPositionLeft: {
      transform: 'translateX(0em)',
    },
    toggleButtonPositionRight: {
      transform: `translateX(${baseWidth / 2}em)`,
    },
    text: {
      color: buttonTextGrey,
      fontSize: '1.15em',
      width: '50%',
      height: '100%',
      position: 'absolute',
      zIndex: '5',
      textAlign: 'center',
      letterSpacing: '0.02em',
      lineHeight: '2.6em',
      fontWeight: '900',
      transition: `color ${animationDuration} ease-in-out`,
      userSelect: 'none',
    },
    leftText: {
    },
    rightText: {
      marginLeft: '50%',
    },
    activeText: {
      color: identityBlue,
    },
  };
};


const Switch = withStyles(styles)((props) => {
  const { classes } = props;
  return (
    <div className={classes.switchWrapper}>
      <div
        className={classNames(
          classes.switch,
          { [classes.switchIsOn]: props.isUser },
          { [classes.switchIsOff]: !props.isUser },
        )}
        onClick={props.handleToggle}
      >
        <span
          className={classNames(
            classes.text,
            classes.leftText,
            { [classes.activeText]: props.isUser },
            )
          }
        >{props.leftText}
        </span>
        <span
          className={classNames(
            classes.text,
            classes.rightText,
            { [classes.activeText]: !props.isUser },
            )
          }
        >{props.rightText}
        </span>
        <ToggleButton isUser={props.isUser} />
      </div>
    </div>
  );
});

const ToggleButton = withStyles(styles)((props) => {
  const { classes } = props;
  return (
    <div
      className={classNames(
        classes.toggleButton,
          { [classes.toggleButtonPositionLeft]: props.isUser },
          { [classes.toggleButtonPositionRight]: !props.isUser },
        )
      }
    />);
});

const RoleSwitch = inject('RootStore')(observer(({
  classes,
  ...props
}) => {
  return (
    <Switch
      isUser={props.isUser}
      handleToggle={props.onClick}
      leftText={props.leftText}
      rightText={props.rightText}
    />
  );
}));

RoleSwitch.propTypes = {
  classes: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  isUser: PropTypes.bool.isRequired,
  leftText: PropTypes.string.isRequired,
  rightText: PropTypes.string.isRequired,
};

export default withStyles(styles)(RoleSwitch);
