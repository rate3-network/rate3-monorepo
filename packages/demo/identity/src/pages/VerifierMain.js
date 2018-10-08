import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import { when } from 'mobx';

import ErrorModal from '../components/ErrorModal';
import ManagementTabs from '../components/verifier/ManagementTabs';
import ManageIndividualUser from './verifier/ManageIndividualUser';
import InstructionModal from '../components/InstructionModal';
import VerifierInstructions from '../components/VerifierInstructions';
import LoadingModal from '../components/LoadingModal';

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
      width: '75%',
      fontSize: '1.2em',
      lineHeight: '1.55em',
      fontWeight: '400',
      marginBottom: '5em',
    },
  });
};

@inject('RootStore') @observer
class VerifierMain extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.RootStore.commonStore.getIsUser()) {
      this.props.history.push('/user');
    }
  }
  componentDidMount() {
    if (window.localStorage.getItem('verifierModalHasShown') !== null) {
      if (window.localStorage.getItem('verifierModalHasShown') === 'true') {
        this.props.RootStore.verifierStore.closeModal();
      } else {
        this.props.RootStore.verifierStore.openModal();
      }
    } else {
      this.props.RootStore.verifierStore.openModal();
    }

    this.props.RootStore.setStartInitNetworkTrue();
    if (window.localStorage.accountType === 'fixed') {
      this.props.RootStore.userStore.changeToFixedAccount();
      this.props.RootStore.initNetwork();
    } else if (window.localStorage.accountType === 'metamask') {
      this.props.RootStore.userStore.changeToMetaMaskAccount();
      this.props.RootStore.initNetwork();
    } else {
      this.props.RootStore.initNetwork();
    }
    
    this.props.RootStore.verifierStore.initDb();
    this.props.RootStore.verifierStore.resetClaimLists();
    this.props.RootStore.verifierStore.populateClaimLists();
    when(
      () => this.props.RootStore.finishInitNetwork,
      () => {
        const account = window.web3.eth.accounts.wallet.add('0xdee21b0158a640ec97638aafa4b4dc3da04e3e314cdfc6835d52029ada3dc4ba');
        this.props.RootStore.verifierStore.getAllUsers();
      },
    );
  }

  render() {
    const { classes, t, RootStore } = this.props;
    const { verifierStore } = RootStore;
    const instructionLength = 4;
    return (
      <div className={classes.container}>
        <ErrorModal open={RootStore.errorModalIsShowing} errMsg={RootStore.errorMessage} />
        <p>{this.identityAddress}</p>
        <InstructionModal
          open={verifierStore.getVerifierModalIsShowing()}
          onClose={() => {verifierStore.closeModal(); window.localStorage.setItem('verifierModalHasShown', 'true'); }}
          handleNext={verifierStore.handleModalNext.bind(verifierStore)}
          handleBack={verifierStore.handleModalBack.bind(verifierStore)}
          activeStep={verifierStore.getModalPage()}
          maxSteps={instructionLength}
        >
          <VerifierInstructions
            activeStep={verifierStore.getModalPage()}
            onChangeIndex={verifierStore.handleModalIndexChange.bind(verifierStore)}
          />
        </InstructionModal>

        <LoadingModal
          open={verifierStore.startedGettingClaim && !verifierStore.finishedGettingClaim}
          subText="Please wait while we are getting this user's claims for you"
        >
          Getting Claims for User...
        </LoadingModal>
        {this.props.RootStore.verifierStore.getUserSelected() !== null ?
          <ManageIndividualUser />
          :
          <div>
            <h1 className={classes.title}>Manage Users</h1>
            <div className={classes.descriptionBox}>
              <p>Manage users who you have verified or have pending verification requests.</p>
              {/* <SearchBar /> */}
              <ManagementTabs />
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
