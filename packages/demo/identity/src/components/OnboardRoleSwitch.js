import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import { genStyle, getClass } from '../utils/index';
import { identityBlue } from '../constants/colors';

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
  root: {
    color: 'grey',
    backgroundColor: 'grey',
  },
  base: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    alignItems: 'normal',
    justifyContent: 'normal',
    color: 'grey',
    backgroundColor: 'grey',
    '&:hover'
  },
  checked: {
    color: 'grey',
    backgroundColor: 'grey',
  },
  icon: {
    borderRadius: 0,
  },
});
const someHandler = () => {console.log('hi')};
const CustomSwitch = ({
  classes,
  onChange,
  isUser,
  leftText,
  rightText,
}) => (
  <div className={classes.container} onClick={onChange}>
    {/* <span className={getClass(classes, 'leftText', isUser)}>{leftText}</span>
    <span className={getClass(classes, 'rightText', isUser)}>{rightText}</span> */}
    <Switch
      onMouseEnter={someHandler}
      onMouseLeave={someHandler}
      checked={true}
      classes={{
        root: classes.root,
        switchBase: classes.base,
        icon: classes.icon,
        checked: classes.checked,
      }}
      disableRipple
      // onChange={this.handleChange('checkedA')}
      value="checkedA"
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
