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
  @observable registryContract = {};
  @observable identityContract = {};
  @observable identityAddress = '';
  constructor(props) {
    super(props);
    if (this.props.RootStore.commonStore.getIsUser()) {
      this.props.history.push('/user');
    }
  }
  componentDidMount() {
    // console.log(verifierPrivKey);
    // window.web3ForCommonNetwork.eth.accounts.wallet.add(verifierPrivKey);
     when(
      () => this.props.RootStore.finishInitNetwork,
      () => {
        
        const contract = new window.web3.eth.Contract(identityRegistryJson.abi, '0x2d0335d5f2405ab1f9d149913b05ad00b9dea041');
        this.registryContract = contract;
        window.registryContract = contract;
        console.log('creating event listener');
        const sub = contract.events.NewIdentity( function(error, event){ console.log('from event listener');console.log(event); })
          .on('data', function(event) {
            console.log('from event listener');
            console.log(event); // same results as the optional callback above
          })
          .on('changed', function(event) {
            console.log('from event listener');
            console.log(event);
          })
          .on('error', console.error);
        
        console.log(sub);
        console.log(contract);
        this.registryContract = contract;
        // const identity = this.registryContract.methods.createIdentity().call().then(console.log);
        
        // console.log('listening for NewIdentity');
       },
    );
  }
  // onUserItemClick(value) {
  //   console.log('clicked');
    
  //   this.props.RootStore.verifierStore.setUserSelected(value);
  //   console.log(this.props.RootStore.verifierStore.getUserSelected());
  // }
  createIdentity() {
    this.registryContract.methods.createIdentity().send({from: '0x110E4bC4286bac52370B4AEF9aE89832C252d794', gas: 6000000}, (err, result) => {console.log(result);});
  }
  getPastEvents() {
    this.registryContract.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' }, (error, events) => { console.log(events); });
  }
  checkHasIdentity() {
    this.registryContract.methods.hasIdentity('0xE4Bfd8b40e78e539eb59719Ad695D0D0132FA502').call().then(console.log);
  }
  @action
  getIdentityContract() {
    this.registryContract.methods.identities('0xE4Bfd8b40e78e539eb59719Ad695D0D0132FA502').call()
      .then((result) => {
        console.log(result);
        runInAction(() => {
          this.identityAddress = result;
        });
        const identityContract = new window.web3.eth.Contract(identityJson.abi, this.identityAddress);
        window.identityContract = identityContract;
      });
  }
  render() {
    const { classes, t, RootStore } = this.props;
    const { verifierStore } = RootStore;
    const instructionLength = 4;
    return (
      <div className={classes.container}>
        <p>{this.identityAddress}</p>
        <button onClick={this.createIdentity.bind(this)}>create identity</button>
        <button onClick={this.getPastEvents.bind(this)}>get past events</button>
        <button onClick={this.checkHasIdentity.bind(this)}>check has identity</button>
        <button onClick={this.getIdentityContract.bind(this)}>get identity contract</button>
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
