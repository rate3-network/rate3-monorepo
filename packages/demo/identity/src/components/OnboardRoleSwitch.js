import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { observer, inject } from 'mobx-react';

const animationDuration = '250ms';
const styles = (theme) => {
  return {
    switchWrapper: {
      width: '100%',
      height: '100vh',
      transition: `background-color ${animationDuration} ease-out`,
    },
    switch: {
      position: 'relative',
      width: '28rem',
      height: '5rem',
      borderRadius: '1%',
      transition: `background-color ${animationDuration} ease-out`,
      zIndex: 1,
      boxShadow: 'inset 0 0 9px rgba(0, 0, 0, 0.2)',
      '&:before': {
        content: '',
        position: 'absolute',
        top: 0,
        backgroundColor: 'inherit',
        borderRadius: '50%',
        width: '5rem',
        height: '5rem',
        zIndex: 2,
        left: '-1rem',
      },
      '&:after': {
        right: '-1rem',
      },
    },
    switchIsOff: {
      backgroundColor: '#F3F3F3',
    },
    switchIsOn: {
      backgroundColor: '#F3F3F3',
    },
    toggleButton: {
      position: 'absolute',
      width: '50%',
      height: '5rem',
      backgroundColor: '#EAF9FF',
      borderRadius: '0%',
      transition: `transform ${animationDuration} ease-in-out`,
      zIndex: '3',
      opacity: '0.99',
      top: '-0.05rem',
      boxShadow: '2px 0 9px rgba(0, 0, 0, 0.2)',
    },
    toggleButtonPositionLeft: {
      transform: 'translateX(0rem)',
    },
    toggleButtonPositionRight: {
      transform: 'translateX(14rem)',
    },
    text: {
      fontSize: '2.1rem',
      width: '50%',
      height: '100%',
      position: 'absolute',
      zIndex: '5',
      textAlign: 'center',
      letterSpacing: '0.05rem',
      lineHeight: '5rem',
      fontWeight: '900',
      transition: `color ${animationDuration} ease-in-out`,
      userSelect: 'none',
    },
    leftText: {
    },
    rightText: {
      marginLeft: '50%',
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
          )
        }
        onClick={props.handleToggle}
      >
        <span
          className={classNames(
            classes.text,
            classes.leftText,
            { 'toggle-gradient-text': props.isUser },
            )
          }
        >{props.leftText}
        </span>
        <span
          className={classNames(
            classes.text,
            classes.rightText,
            { 'toggle-gradient-text': !props.isUser },
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
