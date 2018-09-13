import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';

import SearchBar from '../components/verifier/SearchBar';
import ManagementTabs from '../components/verifier/ManagementTabs';
import ManageIndividualUser from './verifier/ManageIndividualUser';

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
      this.props.history.push('/user');
    } else {
      this.props.history.push('/verifier');
    }
    
  }
  // onUserItemClick(value) {
  //   console.log('clicked');
    
  //   this.props.RootStore.verifierStore.setUserSelected(value);
  //   console.log(this.props.RootStore.verifierStore.getUserSelected());
  // }
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        {this.props.RootStore.verifierStore.getUserSelected() !== null ?
          <ManageIndividualUser />
          :
          <div>
            <h1 className={classes.title}>Manage Users</h1>
            <div className={classes.descriptionBox}>
              <p>This is your reusuable identity that is improved by verifications which authenticates a part of your identity.</p>
              <SearchBar />
              <ManagementTabs onUserItemClick={this.onUserItemClick} />
            </div>
          </div>
        }
      </div>
    );
  }
}


VerifierMain.propTypes = {
  
};

export default withStyles(styles)(VerifierMain);
