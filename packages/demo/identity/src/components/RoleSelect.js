import React from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import ClassNames from 'classnames';

import { identityBlue } from '../constants/colors';

const animationDuration = '250ms';
const styles = (theme) => {
  return ({
    container: {
      width: '20rem',
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
};
@inject('RootStore') @observer
class ToggleButtons extends React.Component {
  componentWillUnmount() {
    this.props.RootStore.commonStore.setFalseShouldRenderOnboardTransition();
    this.props.RootStore.initNetwork();
    // if (this.props.RootStore.commonStore.getIsUser() && !this.props.RootStore.userStore.isOnFixedAccount) {
    //   this.props.RootStore.commonStore.checkMetamaskNetwork();
    // }
  }
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <div className={classes.buttonGroup}>
          <div
            onClick={this.props.handleUserClick} 
            className={ClassNames(classes.button, { [classes.buttonActive]: this.props.isUser })}
          >
            {this.props.leftText}
          </div>
          <div
            onClick={this.props.handleVerifierClick} 
            className={ClassNames(classes.button, { [classes.buttonActive]: !this.props.isUser })}
          >
            {this.props.rightText}
          </div>
        </div>
      </div>
    );
  }
}


ToggleButtons.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ToggleButtons);
