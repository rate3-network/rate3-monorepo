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
import idb from 'idb';

import identityRegistryJson from '../build/contracts/IdentityRegistry.json';
import identityJson from '../build/contracts/Identity.json';
import { PENDING_REVIEW, PENDING_ADD, VERIFIED } from '../constants/general';

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


  constructor(props) {
    super(props);
    if (!this.props.RootStore.commonStore.getIsUser()) {
      this.props.history.push('/verifier');
    }
  }

  async putSomeData() {
    let db = await idb.open('rate3-db', 1, upgradeDB => upgradeDB.createObjectStore('identity-store', { autoIncrement: true }));
    let tx = db.transaction('identity-store', 'readwrite');
    let store = tx.objectStore('identity-store');

    // await store.put({  });

    await tx.complete;
    db.close();
  }
  
  componentDidMount() {

    this.putSomeData();
    // testing creating contract
    // console.log(identityJson);
    let storage = window.localStorage;
    if (storage.getItem('table') === null) {
      storage.setItem('table', []);
    }
    
    const table = storage.getItem('table') === '' ? [] : JSON.parse(storage.getItem('table'));
    this.props.RootStore.userStore.setIdentityTable(table);

    when(
      () => this.props.RootStore.finishInitNetwork,
      () => {
        this.props.RootStore.userStore.getUserAddr();
        const contract = new window.web3.eth.Contract(identityRegistryJson.abi, this.props.RootStore.userStore.registryContractAddr);
        this.props.RootStore.userStore.registryContract = contract;
        window.registryContract = contract;
        // const sub = contract.events.NewIdentity( function(error, event){ console.log('from event listener');console.log(event); })
        //   .on('data', function(event) {
        //     console.log('from event listener');
        //     console.log(event); // same results as the optional callback above
        //   })
        //   .on('changed', function(event) {
        //     console.log('from event listener');
        //     console.log(event);
        //   })
        //   .on('error', console.error);
        
        // console.log(sub);
        // console.log(contract);
        // this.registryContract = contract;
        // this.getPastEvents();
        // this.checkHasIdentity();
        // const identity = this.registryContract.methods.createIdentity().call().then(console.log);
        
        // console.log('listening for NewIdentity');
       },
    );
    when(
      () => this.props.RootStore.userStore.userAddr,
      () => {
        this.props.RootStore.userStore.getIdentities();
      }
    );
  }

  onRegisterSuccess() {
    this.props.RootStore.userStore.closeRegisterModal();
    console.log(this.props.RootStore.userStore.getFormTextInputValue(), this.props.RootStore.userStore.getVerifierSelected());
    let storage = window.localStorage;
    if (storage.getItem('table') === null) {
      storage.setItem('table', []);
    }
    
    const table = storage.getItem('table') === '' ? [] : JSON.parse(storage.getItem('table'));
    const claimToStore = {
      id: `${this.props.RootStore.userStore.getFormTextInputValue()}.${Math.random()}`, // pseudo unique id
      status: PENDING_REVIEW,
      user: this.props.RootStore.userStore.userAddr,
      type: this.props.RootStore.userStore.formType,
      value: this.props.RootStore.userStore.getFormTextInputValue(),
      verifier: this.props.RootStore.userStore.getVerifierSelected(),
    };
    table.push(claimToStore);
    this.props.RootStore.userStore.setIdentityTable(table);
    storage.setItem('table', JSON.stringify(table));

    this.props.RootStore.userStore.openRegisterSuccessModal();
  }
  
  render() {
    const { classes, t, RootStore } = this.props;
    const { userStore } = RootStore;
    const instructionLength = 4;
    return (
      <div className={classes.container}>
        {/* <button onClick={this.createIdentity.bind(this)}>create identity</button>
        <button onClick={this.getPastEvents.bind(this)}>get past events</button>
        <button onClick={this.checkHasIdentity.bind(this)}>check has identity</button>
        <button onClick={this.getIdentityContract.bind(this)}>get identity contract</button> */}
        {/* <button onClick={this.props.RootStore.userStore.addClaim.bind(this.props.RootStore.userStore)}>add claim</button> */}
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
          title={t('registrationSuccessTitle')}
          content={t('registrationSuccessContent')}
        />
        <h1 className={classes.title}>My Identity</h1>
        <div className={classes.descriptionBox}>
          <p>This is your reusuable identity that is improved by verifications which authenticates a part of your identity.</p>
          {userStore.getIdentityNames().length > 0 ?
            <ExpandablePanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Name" items={userStore.getIdentityNames()} /> :
            <FixedPanel isUser={this.props.RootStore.commonStore.getIsUser()} handleClick={() => {userStore.openRegisterModal("name");}} title="Name" />
          }
          {userStore.getIdentityAddresses().length > 0 ?
            <ExpandablePanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Address" items={userStore.getIdentityAddresses()} /> :
            <FixedPanel isUser={this.props.RootStore.commonStore.getIsUser()} handleClick={() => {userStore.openRegisterModal("address");}} title="Address" />
          }
          {userStore.getIdentitySocialIds().length > 0 ?
            <ExpandablePanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Social ID" items={userStore.getIdentitySocialIds()} /> :
            <FixedPanel isUser={this.props.RootStore.commonStore.getIsUser()} handleClick={() => {userStore.openRegisterModal("socialId");}} title="Social ID" />
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
