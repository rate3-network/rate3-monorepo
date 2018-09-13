import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';

import SearchBar from '../components/verifier/SearchBar';
import ManagementTabs from '../components/verifier/ManagementTabs';

const styles = (theme) => {
  return ({
    container: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      letterSpacing: '0.02em',
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
class VerifierMain extends React.Component {
  componentDidMount() {
    if (this.props.RootStore.commonStore.getIsUser()) {
      console.log('u');
      this.props.history.push('/user');
    } else {
      console.log('v');
      this.props.history.push('/verifier');
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <h1 className={classes.title}>Manage Users</h1>
        <div className={classes.descriptionBox}>
          <p>This is your reusuable identity that is improved by verifications which authenticates a part of your identity.</p>
          <SearchBar />
          <ManagementTabs />
        </div>
      </div>
    );
  }
}


VerifierMain.propTypes = {
  
};

export default withStyles(styles)(VerifierMain);
