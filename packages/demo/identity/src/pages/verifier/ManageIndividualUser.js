import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { inject, observer } from 'mobx-react';
import ChevronLeft from '@material-ui/icons/ChevronLeftRounded';
import IconButton from '@material-ui/core/IconButton';

const styles = (theme) => {
  return ({
    title: {
      letterSpacing: '0.02em',
      display: 'flex',
      alignItems: 'center',
      left: '-1.5em',
      position: 'relative',
    },
    label: {
      fontSize: '1.5em',
      lineHeight: '1.5em',
    },
    descriptionBox: {
      width: '65%',
      fontSize: '1.2em',
      lineHeight: '1.55em',
      fontWeight: '400',
      marginBottom: '5em',
    },
  });
};

@inject('RootStore') @observer
class ManageIndividualUser extends Component {
  componentDidMount() {
    window.onpopstate = this.props.RootStore.verifierStore.resetUserSelected.bind(this.props.RootStore.verifierStore);
  }
  render() {
    const { classes } = this.props;
    return (
      <div>
        <h1 className={classes.title}>
          <IconButton 
            onClick={this.props.RootStore.verifierStore.resetUserSelected.bind(this.props.RootStore.verifierStore)}>
            <ChevronLeft className={classes.label} />
          </IconButton>
          <div>{this.props.RootStore.verifierStore.getUserSelected()}</div>
        </h1>
        <div className={classes.descriptionBox}>
          <p>You can approve this user’s verifications if he/she has registered. You can also add verifications for the user.</p>
        </div>
      </div>
    );
  }
}

ManageIndividualUser.propTypes = {

};

export default withStyles(styles)(ManageIndividualUser);
