import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { observer, inject } from 'mobx-react';
import { toggleGradient } from '../constants/colors';

const styles = (theme) => {
  return {
    switchWrapper: {
      width: '100%',
      height: '100vh',
      transition: 'background-color 100ms ease-out',
    },
    switch: {
      position: 'relative',
      width: '28rem',
      height: '5rem',
      borderRadius: '1%',
      transition: 'background-color 100ms ease-out',
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
      transition: 'transform 100ms ease-in-out',
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
      transition: 'color 100ms ease-in-out',
      userSelect: 'none',
    },
    leftText: {
    },
    rightText: {
      marginLeft: '50%',
    },
  };
};


const Switch = inject('RootStore')(withStyles(styles)((props) => {
  const { classes } = props;
  return (
    <div className={classes.switchWrapper}>
      <div
        className={classNames(
          classes.switch,
            { [classes.switchIsOn]: props.RootStore.commonStore.getIsUser() },
            { [classes.switchIsOff]: !props.RootStore.commonStore.getIsUser() },
          )
        }
        onClick={props.handleToggle}
      >
        <span
          className={classNames(
            classes.text,
            classes.leftText,
            { 'toggle-gradient-text': props.RootStore.commonStore.getIsUser() },
            )
          }
        >User
        </span>
        <span
          className={classNames(
            classes.text,
            classes.rightText,
            { 'toggle-gradient-text': !props.RootStore.commonStore.getIsUser() },
            )
          }
        >Verifier
        </span>
        <ToggleButton
          isOn={props.RootStore.commonStore.getIsUser()}
        />
      </div>
    </div>
  );
}));

const ToggleButton = inject('RootStore')(withStyles(styles)((props) => {
  const { classes } = props;
  return (
    <div
      className={classNames(
        classes.toggleButton,
          { [classes.toggleButtonPositionLeft]: props.RootStore.commonStore.getIsUser() },
          { [classes.toggleButtonPositionRight]: !props.RootStore.commonStore.getIsUser() },
        )
      }
    />);
}));

const FinalSwitch = inject('RootStore')(observer((props) => {
  return (  
    <Switch
      turnedOn
      test="black"
      isOn={props.RootStore.commonStore.getIsUser()}
      handleToggle={props.RootStore.commonStore.toggleRole.bind(props.RootStore.commonStore)}
    />
  );
}));

const CustomSwitch = observer(({
  classes,
  onChange,
  isUser,
  leftText,
  rightText,
  ...props
}) => {
  return (
    <FinalSwitch />
  );
});

CustomSwitch.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  isUser: PropTypes.bool.isRequired,
  leftText: PropTypes.string.isRequired,
  rightText: PropTypes.string.isRequired,
};

export default inject('RootStore')(withStyles(styles, { withTheme: true })(CustomSwitch));
