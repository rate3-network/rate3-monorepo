import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import { observable, when, action, runInAction } from 'mobx';

import SearchBar from '../components/verifier/SearchBar';
import ManagementTabs from '../components/verifier/ManagementTabs';
import ManageIndividualUser from './verifier/ManageIndividualUser';
import InstructionModal from '../components/InstructionModal';
import VerifierInstructions from '../components/VerifierInstructions';
import { verifierPrivKey } from '../constants/defaults';

import identityRegistryJson from '../build/contracts/IdentityRegistry.json';
import identityJson from '../build/contracts/Identity.json';

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
    this.props.RootStore.setStartInitNetworkTrue();
    if (window.localStorage.accountType === 'fixed') {
      this.props.RootStore.userStore.changeToFixedAccount();
      this.props.RootStore.initNetwork();
      console.log('changing to fixed account');
    } else if (window.localStorage.accountType === 'metamask') {
      this.props.RootStore.userStore.changeToMetaMaskAccount();
      this.props.RootStore.initNetwork();
      console.log('changing to metamask');
    } else {
      this.props.RootStore.initNetwork();
    }
    
    this.props.RootStore.verifierStore.initDb();
    this.props.RootStore.verifierStore.resetClaimLists();
    this.props.RootStore.verifierStore.populateClaimLists();
    when(
      () => this.props.RootStore.finishInitNetwork,
      () => {
        console.log('adding to wallet');
    const account = window.web3.eth.accounts.wallet.add('0xdee21b0158a640ec97638aafa4b4dc3da04e3e314cdfc6835d52029ada3dc4ba');
    console.log(window.web3.eth.accounts.wallet);
        this.props.RootStore.verifierStore.getRegistryContract();
      },
    );
  }

  render() {
    const { classes, t, RootStore } = this.props;
    const { verifierStore } = RootStore;
    const instructionLength = 4;
    return (
      <div className={classes.container}>
        <p>{this.identityAddress}</p>
        <InstructionModal
          open={verifierStore.getVerifierModalIsShowing()}
          onClose={verifierStore.closeModal.bind(verifierStore)}
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
        {this.props.RootStore.verifierStore.getUserSelected() !== null ?
          <ManageIndividualUser />
          :
          <div>
            <h1 className={classes.title}>Manage Users</h1>
            <div className={classes.descriptionBox}>
              <p>This is your reusuable identity that is improved by verifications which authenticates a part of your identity.</p>
              <SearchBar />
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
