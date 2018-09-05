import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import { genStyle, getClass } from '../../utils';
import {
  trusteeNavToggleBg,
  trusteeNavToggleEmphasis,
  trusteeNavTogglePrimary,
  trusteeNavToggleSecondary,
  navToggleBoxShadow,
  userNavToggleBg,
  userNavToggleEmphasis,
  userNavTogglePrimary,
  userNavToggleSecondary,
} from '../../constants/colors';

const switchWidth = 200;
const switchHeight = 50;

const styles = theme => ({
  container: {
    position: 'relative',
    width: switchWidth,
    margin: 'auto',
    cursor: 'pointer',
    userSelect: 'none',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: '0.9em',
  },
  ...genStyle('leftText', isUser => ({
    position: 'absolute',
    left: 0,
    width: switchWidth * 0.53,
    zIndex: 999,
    lineHeight: `${switchHeight}px`,
    color: isUser ? userNavTogglePrimary : trusteeNavToggleSecondary,
  })),
  ...genStyle('rightText', isUser => ({
    position: 'absolute',
    right: 0,
    width: switchWidth * 0.53,
    zIndex: 999,
    lineHeight: `${switchHeight}px`,
    color: isUser ? userNavToggleSecondary : trusteeNavTogglePrimary,
  })),
  ...genStyle('root', isUser => ({
    width: switchWidth,
    verticalAlign: 'initial',
  })),
  ...genStyle('base', isUser => ({
    width: '100%',
    height: '100%',
    borderRadius: 0,
    alignItems: 'normal',
    justifyContent: 'normal',
    '&$userChecked': {
      color: userNavTogglePrimary,
      '& + $userBar': {
        backgroundColor: userNavToggleBg,
      },
    },
    '&$trusteeChecked': {
      color: trusteeNavTogglePrimary,
      '& + $trusteeBar': {
        backgroundColor: trusteeNavToggleBg,
      },
    },
  })),
  ...genStyle('checked', isUser => ({
    transform: 'translateX(0)',
    '& $userIcon': {
      transform: `translateX(${switchWidth * 0.47 - 1}px)`,
    },
    '& $trusteeIcon': {
      transform: `translateX(${switchWidth * 0.47 - 1}px)`,
    },
    '& + $userBar': {
      opacity: 1,
      border: 'none',
    },
    '& + $trusteeBar': {
      opacity: 1,
      border: 'none',
    },
  })),
  ...genStyle('bar', isUser => ({
    width: switchWidth,
    borderRadius: switchHeight / 2,
    height: switchHeight,
    marginTop: -switchHeight / 2,
    marginLeft: -switchWidth / 2,
    border: 'none',
    boxSizing: 'border-box',
    boxShadow: `inset 3px 3px 8px ${navToggleBoxShadow}`,
    backgroundColor: isUser ? userNavToggleBg : trusteeNavToggleBg,
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  })),
  ...genStyle('icon', isUser => ({
    width: switchWidth * 0.53,
    height: switchHeight - 2,
    borderRadius: switchHeight / 2 - 1,
    border: 'none',
    boxSizing: 'border-box',
    boxShadow: `2px 0px 4px ${navToggleBoxShadow}`,
    backgroundColor: isUser ? userNavToggleEmphasis : trusteeNavToggleEmphasis,
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.sharp,
    }),
  })),
});

const CustomSwitch = ({
  classes,
  onChange,
  isUser,
  leftText,
  rightText,
}) => (
  <div className={classes.container} onClick={onChange}>
    <span className={getClass(classes, 'leftText', isUser)}>{leftText}</span>
    <span className={getClass(classes, 'rightText', isUser)}>{rightText}</span>
    <Switch
      classes={{
        root: getClass(classes, 'root', isUser),
        switchBase: getClass(classes, 'base', isUser),
        bar: getClass(classes, 'bar', isUser),
        icon: getClass(classes, 'icon', isUser),
        iconChecked: getClass(classes, 'iconChecked', isUser),
        checked: getClass(classes, 'checked', isUser),
      }}
      disableRipple
      checked={!isUser}
      onChange={onChange}
    />
  </div>
);

CustomSwitch.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  isUser: PropTypes.bool.isRequired,
  leftText: PropTypes.string.isRequired,
  rightText: PropTypes.string.isRequired,
};

export default withStyles(styles, { withTheme: true })(CustomSwitch);
