import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import { observer, inject } from 'mobx-react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { identityBlue } from '../constants/colors';

const switchWidth = 200;
const switchHeight = 50;

// const styles = theme => ({
//   container: {
//     position: 'relative',
//     width: switchWidth,
//     margin: 'auto',
//     cursor: 'pointer',
//     userSelect: 'none',
//     textTransform: 'uppercase',
//     fontWeight: 'bold',
//     fontSize: '0.9em',
//     // backgroundColor: 'grey',
//   },
//   root: {
//     backgroundColor: '#F3F3F3',
//   },
//   base: {
//     // width: '100%',
//     height: '100%',
//     borderRadius: 0,
//     alignItems: 'normal',
//     justifyContent: 'normal',
//     color: 'grey',
//     backgroundColor: '#F3F3F3',
//     '&:hover': {
//       backgroundColor: '#F3F3F3',
//     },
//   },
//   checked: {
//     // color: 'pink',
//     backgroundColor: '#F3F3F3',
//   },
//   icon: {
//     borderRadius: 0,
//     width: '50%',
//     color: '#EAF9FF',
//   },
//   iconChecked: {
//     borderRadius: 0,
//     width: '50%',
//     color: '#EAF9FF',
//   },
// });
const styles = theme => ({
  colorBar: {},
  colorChecked: {},
  iOSSwitchBase: {
    '&$iOSChecked': {
      color: theme.palette.common.white,
      '& + $iOSBar': {
        backgroundColor: '#F3F3F3',
      },
    },
    
  },
  iOSChecked: {
    transform: 'translateX(15px)',
    '& + $iOSBar': {
      opacity: 1,
      border: 'none',
    },
    '&:before': {
      content: '"h"',
    },
  },
  iOSBar: {
    borderRadius: 0,
    width: 42,
    height: 26,
    marginTop: -13,
    marginLeft: -21,
    // border: 'solid 1px',
    // borderColor: theme.palette.grey[400],
    backgroundColor: '#F3F3F3',
    opacity: 1,
    // transition: theme.transitions.create(['background-color', 'border']),
  },
  iOSIcon: {
    borderRadius: 0,
    width: 24,
    height: 24,
  },
  iOSIconChecked: {
    boxShadow: theme.shadows[1],
  },
});
const CustomSwitch = observer(({
  classes,
  onChange,
  isUser,
  leftText,
  rightText,
  ...props
}) => (
  <div className={classes.container} onClick={onChange}>
  {/* <span>test</span> */}
    <FormControlLabel
      control={
        <Switch
          classes={{
            switchBase: classes.iOSSwitchBase,
            bar: classes.iOSBar,
            icon: classes.iOSIcon,
            iconChecked: classes.iOSIconChecked,
            checked: classes.iOSChecked,
          }}
          disableRipple
          checked={props.RootStore.commonStore.getIsUser()}
          onChange={props.RootStore.commonStore.toggleRole.bind(props.RootStore.commonStore)}
          value="checkedB"
        />
        }
    />
    {/* <h1>{props.RootStore.commonStore.getIsUser() ? 'true' : 'false'}</h1> */}
  </div>
));

CustomSwitch.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  isUser: PropTypes.bool.isRequired,
  leftText: PropTypes.string.isRequired,
  rightText: PropTypes.string.isRequired,
};

export default inject('RootStore')(withStyles(styles, { withTheme: true })(CustomSwitch));
