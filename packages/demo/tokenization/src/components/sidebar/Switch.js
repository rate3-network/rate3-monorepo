import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import { genStyle, getClass } from '../../utils';
import {
  issuerNavToggleBg,
  issuerNavToggleEmphasis,
  issuerNavTogglePrimary,
  issuerNavToggleSecondary,
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
    lineHeight: `${switchHeight}px`,
    cursor: 'pointer',
    userSelect: 'none',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: '0.9em',
  },
  ...genStyle('leftText', isUser => ({
    position: 'absolute',
    left: 0,
    width: switchWidth * 0.55,
    zIndex: 999,
    color: isUser ? userNavTogglePrimary : issuerNavToggleSecondary,
  })),
  ...genStyle('rightText', isUser => ({
    position: 'absolute',
    right: 0,
    width: switchWidth * 0.55,
    zIndex: 999,
    color: isUser ? userNavToggleSecondary : issuerNavTogglePrimary,
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
    '&$issuerChecked': {
      color: issuerNavTogglePrimary,
      '& + $issuerBar': {
        backgroundColor: issuerNavToggleBg,
      },
    },
  })),
  ...genStyle('checked', isUser => ({
    transform: 'translateX(0)',
    '& $userIcon': {
      transform: `translateX(${switchWidth * 0.45 - 1}px)`,
    },
    '& $issuerIcon': {
      transform: `translateX(${switchWidth * 0.45 - 1}px)`,
    },
    '& + $userBar': {
      opacity: 1,
      border: 'none',
    },
    '& + $issuerBar': {
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
    backgroundColor: isUser ? userNavToggleBg : issuerNavToggleBg,
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  })),
  ...genStyle('icon', isUser => ({
    width: switchWidth * 0.55,
    height: switchHeight - 2,
    borderRadius: switchHeight / 2 - 1,
    border: 'none',
    boxSizing: 'border-box',
    boxShadow: `2px 0px 4px ${navToggleBoxShadow}`,
    backgroundColor: isUser ? userNavToggleEmphasis : issuerNavToggleEmphasis,
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
