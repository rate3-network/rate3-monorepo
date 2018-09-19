import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import { observable, when, action, runInAction } from 'mobx';
import { translate } from 'react-i18next';
import { Route, Switch, withRouter } from 'react-router-dom';

import ExpandablePanel from '../components/ExpandablePanel';
import FixedPanel from '../components/FixedPanel';
import InstructionModal from '../components/InstructionModal';
import UserInstructions from '../components/user/UserInstructions';
import RegistrationModal from '../components/user/RegistrationModal';
import SuccessModal from '../components/SuccessModal';

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
class UserMain extends React.Component {
  @observable registryContract = {};
  @observable identityContract = {};
  @observable identityAddress = '';
  constructor(props) {
    super(props);
    if (!this.props.RootStore.commonStore.getIsUser()) {
      this.props.history.push('/verifier');
    }
  }
  
  componentDidMount() {
    // testing creating contract
    // console.log(identityJson);
    
    when(
      () => this.props.RootStore.finishInitNetwork,
      () => {
        
        const contract = new window.web3.eth.Contract(identityRegistryJson.abi, '0x2d0335d5f2405ab1f9d149913b05ad00b9dea041');
        this.registryContract = contract;
        window.registryContract = contract;
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
  onRegisterSuccess() {
    this.props.RootStore.userStore.closeRegisterModal();
    this.props.RootStore.userStore.openRegisterSuccessModal();
  }
  createIdentity() {
    this.registryContract.methods.createIdentity().send({from: '0xC819277Bd0198753949c0b946da5d8a0cAfd1cB8', gas: 6000000}, (err, result) => {console.log(result);});
  }
  getPastEvents() {
    this.registryContract.getPastEvents('NewIdentity', { fromBlock: 0, toBlock: 'latest' }, (error, events) => { console.log(events); });
  }
  checkHasIdentity() {
    this.registryContract.methods.hasIdentity('0xC819277Bd0198753949c0b946da5d8a0cAfd1cB8').call().then(console.log);
  }
  @action
  getIdentityContract() {
    this.registryContract.methods.identities('0xC819277Bd0198753949c0b946da5d8a0cAfd1cB8').call()
      .then((result) => {
        console.log(result);
        runInAction(() => {
          this.identityAddress = result;

          const identityContract = new window.web3.eth.Contract(identityJson.abi, this.identityAddress);
          window.identityContract = identityContract;
          this.identityContract = identityContract;
        });
        
      });
  }
  addClaim() {
    const nameClaim = {name: 'whatisdis???'};
    const data = window.web3.utils.asciiToHex(JSON.stringify(nameClaim));
    const addr = '0xC819277Bd0198753949c0b946da5d8a0cAfd1cB8';
    const topic = 101;
    const sig = window.web3.utils.soliditySha3(addr, topic, data);
    const location = "some location";
    console.log(sig);
    this.identityContract.methods.addClaim(topic, 1, addr, sig, data, location).send({from: '0xC819277Bd0198753949c0b946da5d8a0cAfd1cB8', gas: 6000000}, (err, result) => {console.log(result);});
  }
  render() {
    const { classes, t, RootStore } = this.props;
    const { userStore } = RootStore;
    const instructionLength = 4;
    return (
      <div className={classes.container}>
        <button onClick={this.createIdentity.bind(this)}>create identity</button>
        <button onClick={this.getPastEvents.bind(this)}>get past events</button>
        <button onClick={this.checkHasIdentity.bind(this)}>check has identity</button>
        <button onClick={this.getIdentityContract.bind(this)}>get identity contract</button>
        <button onClick={this.addClaim.bind(this)}>add claim</button>
        <InstructionModal
          open={userStore.getUserModalIsShowing()}
          onClose={userStore.closeModal.bind(userStore)}
          handleNext={userStore.handleModalNext.bind(userStore)}
          handleBack={userStore.handleModalBack.bind(userStore)}
          activeStep={userStore.getModalPage()}
          maxSteps={instructionLength}
        >
          <UserInstructions
            activeStep={userStore.getModalPage()}
            onChangeIndex={userStore.handleModalIndexChange.bind(userStore)}
          />
        </InstructionModal>
        <RegistrationModal
          open={userStore.getRegisterModalIsShowing()}
          onClose={userStore.closeRegisterModal.bind(userStore)}
          handleClick={(e) => { userStore.setVerifierSelected(e.target.value); }}
          textInputValue={userStore.getFormTextInputValue()}
          handleChange={(e) => { userStore.setFormTextInputValue(e.target.value); }}
          verifierList={userStore.getVerifierList()}
          verifier={userStore.getVerifierSelected()}
          onRegisterSuccess={this.onRegisterSuccess.bind(this)}
        />
        <SuccessModal
          open={userStore.getRegisterSuccessModalIsShowing()}
          onClose={userStore.closeRegisterSuccessModal.bind(userStore)}
        />
        <h1 className={classes.title}>My Identity</h1>
        <div className={classes.descriptionBox}>
          <p>This is your reusuable identity that is improved by verifications which authenticates a part of your identity.</p>
          {userStore.getIdentityNames().length > 0 ?
            <ExpandablePanel title="Name" items={userStore.getIdentityNames()} /> :
            <FixedPanel handleClick={userStore.openRegisterModal.bind(userStore)} title="Name" />
          }
          {userStore.getIdentityAddresses().length > 0 ?
            <ExpandablePanel title="Address" items={userStore.getIdentityAddresses()} /> :
            <FixedPanel title="Address" />
          }
          {userStore.getIdentitySocialIds().length > 0 ?
            <ExpandablePanel title="Social ID" items={userStore.getIdentitySocialIds()} /> :
            <FixedPanel title="Social ID" />
          }
        </div>
      </div>
    );
  }
}


UserMain.propTypes = {
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};
UserMain.wrappedComponent.propTypes = {
  RootStore: PropTypes.object.isRequired,
};

export default withStyles(styles)(translate('general')(withRouter(UserMain)));
