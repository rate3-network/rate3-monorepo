import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import { when, runInAction } from 'mobx';
import { translate } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import ExpandablePanel from '../components/ExpandablePanel';
import FixedPanel from '../components/FixedPanel';
import InstructionModal from '../components/InstructionModal';
import UserInstructions from '../components/user/UserInstructions';
import RegistrationModal from '../components/user/RegistrationModal';
import SuccessModal from '../components/SuccessModal';
import LoadingModal from '../components/LoadingModal';
import identityRegistryJson from '../build/contracts/IdentityRegistry.json';
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

  componentDidMount() {
    this.props.RootStore.userStore.initDb();
    this.props.RootStore.userStore.resetClaimLists();

    
    when(
      () => !this.props.RootStore.userStore.isOnFixedAccount && this.props.RootStore.finishInitNetwork,
      () => {
        this.props.RootStore.userStore.getUserAddr();
        const contract = new window.web3.eth.Contract(
          identityRegistryJson.abi,
          this.props.RootStore.userStore.registryContractAddr,
        );
        this.props.RootStore.userStore.registryContract = contract;
        window.registryContract = contract;
      },
    );

    when(
      () => this.props.RootStore.userStore.isOnFixedAccount && this.props.RootStore.finishInitNetwork,
      () => {
        const contract = new window.web3.eth.Contract(
          identityRegistryJson.abi,
          this.props.RootStore.userStore.registryContractAddr,
        );
        this.props.RootStore.userStore.registryContract = contract;
        window.registryContract = contract;

        this.props.RootStore.userStore.populateClaimLists();
        this.props.RootStore.userStore.getIdentities();
      },
    );
    // const fixedAccountReady = this.
    when(
      () => this.props.RootStore.userStore.userAddr && this.props.RootStore.finishInitNetwork,
      () => {
        console.log('getting identites');
        this.props.RootStore.userStore.populateClaimLists();
        this.props.RootStore.userStore.getIdentities();
      },
    );

  }

  onRegisterSuccess() {
    this.props.RootStore.userStore.closeRegisterModal();
    console.log('on register succ', this.props.RootStore.userStore.getFormTextInputValue(), this.props.RootStore.userStore.getVerifierSelected());

    const claimToStore = {
      status: PENDING_REVIEW,
      user: this.props.RootStore.userStore.isOnFixedAccount ? this.props.RootStore.userStore.fixedUserAddr : this.props.RootStore.userStore.userAddr,
      type: this.props.RootStore.userStore.formType,
      value: this.props.RootStore.userStore.getFormTextInputValue(),
      verifier: this.props.RootStore.userStore.getVerifierSelected(),
    };
    this.props.RootStore.userStore.db.addClaim(
      this.props.RootStore.userStore.getFormTextInputValue(),
      this.props.RootStore.userStore.formType,
      this.props.RootStore.userStore.isOnFixedAccount ? this.props.RootStore.userStore.fixedUserAddr : this.props.RootStore.userStore.userAddr,
      this.props.RootStore.userStore.getVerifierSelected(),
      PENDING_REVIEW,
    );
    switch (this.props.RootStore.userStore.formType) {
      case 'name':
        runInAction(() => {
          this.props.RootStore.userStore.nameClaimList.push(claimToStore);
        });
        break;
      case 'address':
        runInAction(() => {
          this.props.RootStore.userStore.addressClaimList.push(claimToStore);
        });
        break;
      case 'socialId':
        runInAction(() => {
          this.props.RootStore.userStore.socialIdClaimList.push(claimToStore);  
        });
        break;
      default:
        break;
    }


    this.props.RootStore.userStore.openRegisterSuccessModal();
  }

  render() {
    const { classes, t, RootStore } = this.props;
    const { userStore } = RootStore;
    const instructionLength = 4;
    return (
      <div className={classes.container}>
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
        <LoadingModal open={userStore.startedDeployingIdentity && !userStore.finishedDeployingIdentity} subText="Please wait while your Rate3 identity is deploying">
          Deploying Contract...
        </LoadingModal>

        <LoadingModal open={userStore.startedLoadingClaims && !userStore.finishedLoadingClaims}>
          Loading Claims...
        </LoadingModal>
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
          {userStore.nameClaimList.length > 0 ?
            <ExpandablePanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Name" items={userStore.nameClaimList} /> :
            <FixedPanel isUser={this.props.RootStore.commonStore.getIsUser()} handleClick={() => {userStore.openRegisterModal("name");}} title="Name" />
          }
          {userStore.addressClaimList.length > 0 ?
            <ExpandablePanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Address" items={userStore.addressClaimList} /> :
            <FixedPanel isUser={this.props.RootStore.commonStore.getIsUser()} handleClick={() => {userStore.openRegisterModal("address");}} title="Address" />
          }
          {userStore.socialIdClaimList.length > 0 ?
            <ExpandablePanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Social ID" items={userStore.socialIdClaimList} /> :
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
