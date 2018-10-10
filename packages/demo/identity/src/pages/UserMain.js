import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import { when, runInAction } from 'mobx';
import { translate } from 'react-i18next';
import { withRouter, Route, Switch } from 'react-router-dom';

import { PENDING_REVIEW, PENDING_ADD, VERIFIED } from '../constants/general';
import ErrorModal from '../components/ErrorModal';
import ExpandablePanel from '../components/ExpandablePanel';
import Faq from './Faq';
import FixedPanel from '../components/FixedPanel';
import identityRegistryJson from '../build/contracts/IdentityRegistry.json';
import InstructionModal from '../components/InstructionModal';
import LoadingModal from '../components/LoadingModal';
import PaymentModal from '../components/PaymentModal';
import RegistrationModal from '../components/user/RegistrationModal';
import ReOnboardModal from '../components/ReOnboardModal';
import Settings from './Settings';
import SuccessModal from '../components/SuccessModal';
import UserInstructions from '../components/user/UserInstructions';

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
    if (window.localStorage.getItem('userModalHasShown') !== null) {
      if (window.localStorage.getItem('userModalHasShown') === 'true') {
        this.props.RootStore.userStore.closeModal();
      } else {
        this.props.RootStore.userStore.openModal();
        window.localStorage.setItem('userModalHasShown', 'true');
      }
    } else {
      this.props.RootStore.userStore.openModal();
      window.localStorage.setItem('userModalHasShown', 'true');
    }
    window.analytics.page('user');
    this.props.RootStore.userStore.initDb();
    this.props.RootStore.userStore.resetClaimLists();

    // Initilize MetaMask Account, get claims from smart contract
    when(
      () => !this.props.RootStore.userStore.isOnFixedAccount && this.props.RootStore.finishInitMetamaskNetwork && this.props.RootStore.commonStore.isWalletSetupDone,
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
      () => this.props.RootStore.userStore.userAddr && this.props.RootStore.finishInitMetamaskNetwork,
      () => {
        this.props.RootStore.userStore.resetClaimLists();
        this.props.RootStore.userStore.populateClaimLists();
        this.props.RootStore.userStore.getValidClaims();
      },
    );

    // Initilize Fixed Account, get claims from smart contract
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
        this.props.RootStore.userStore.getValidClaims();
      },
    );

    when(
      () => this.props.RootStore.commonStore.isWalletSetupDone,
      () => {
        this.props.RootStore.closeReonboardModal();
      },
    );

    when(
      () => this.props.RootStore.userStore.startedLoadingClaims && this.props.RootStore.userStore.finishedLoadingClaims,
      () => {
        console.log('finished loading');
        console.log(this.props.RootStore.userStore.removalList);
        const { nameClaimList, removalList } = this.props.RootStore.userStore;
        const nameRemovalList = removalList.getNameClaimRemovals();
        if (nameClaimList.length > 0 && typeof nameRemovalList !== 'undefined' && nameRemovalList.length > 0) {
          const nameClaim = nameClaimList[0];
          
          console.log('nameClaim', nameClaim);
          console.log('nameRemovalList', nameRemovalList);

          const foundId = removalList.findIndexByClaim(nameClaim);
          
          if (typeof foundId === 'number' && foundId > -1) {
            console.log(foundId);
            console.log('same claim found, lets start polling');
            this.pollForTransaction(removalList.getList()[foundId].hash);
            // set the claim status to pending removal / removing
          } else {
            console.log('not the same');
          }
        }
      },
    );
  }
  test() {

  }
  pollForTransaction(removalTxHash) {
    const checkTransactionStatus = async () => {
      console.log('polling');
      const receipt = await window.web3.eth.getTransactionReceipt(removalTxHash);
      if (receipt !== null) {
        if (receipt.status) { // if tx successful
          // modal: removed. refresh to see
          console.log('modal: removed. refresh to see');
          clearInterval(polling);
        } else { // if tx failed
          console.log('delete from removalList');
          // delete from removalList
          clearInterval(polling);
        }
      }
    };
    let polling = setInterval(checkTransactionStatus, 1000);
  }
  // pollForTransaction(removalTxHash) {
  //   window.web3.eth.getTransaction(removalTxHash);
  // }
  onRegisterSuccess() {
    this.props.RootStore.userStore.closeRegisterModal();

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
      this.props.RootStore.currentNetwork,
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
    const { userStore, commonStore, paymentStore } = RootStore;
    const instructionLength = 4;
    return (
      <div className={classes.container}>
        <Switch>
          <Route path="/user/faq" component={Faq} />
          <Route path="/user/settings" component={Settings} />
        </Switch>
        <ErrorModal open={RootStore.errorModalIsShowing} errMsg={RootStore.errorMessage} />
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
        <LoadingModal
          open={userStore.startedDeployingIdentity && !userStore.finishedDeployingIdentity}
          subText="Please wait while your Rate3 identity is deploying"
        >
          Deploying Contract...
        </LoadingModal>
        <SuccessModal
          open={userStore.startedDeployingIdentity && userStore.finishedDeployingIdentity}
          onClose={() => { window.location.reload(); }}
          title={t('deploySuccessTitle')}
          content={t('deploySuccessContent')}
        />
        <SuccessModal
          open={userStore.startedRemovingClaim && userStore.finishedRemovingClaim}
          onClose={() => { window.location.reload(); }}
          title={t('Claim Removed')}
          content={t('Your verification has been removed from the blockchain. You can view the transaction in Metamask.')}
        />
        <PaymentModal
          open={paymentStore.paymentModalIsShowing}
        />
        <LoadingModal open={userStore.startedLoadingClaims && !userStore.finishedLoadingClaims}>
          Loading Claims...
        </LoadingModal>
        <ReOnboardModal open={RootStore.reonboardModalIsShowing} />
        <RegistrationModal
          open={userStore.getRegisterModalIsShowing()}
          onClose={() => { userStore.resetRegistrationForm(); userStore.closeRegisterModal(); }}
          handleClick={(e) => { userStore.setVerifierSelected(e.target.value); }}
          textInputValue={userStore.getFormTextInputValue()}
          handleChange={(e) => { userStore.setFormTextInputValue(e.target.value); }}
          verifierList={userStore.getVerifierList()}
          verifier={userStore.getVerifierSelected()}
          onRegisterSuccess={() => { this.onRegisterSuccess(); userStore.resetRegistrationForm(); }}
        />
        <SuccessModal
          open={userStore.getRegisterSuccessModalIsShowing()}
          onClose={userStore.closeRegisterSuccessModal.bind(userStore)}
          title={t('registrationSuccessTitle')}
          content={t('registrationSuccessContent')}
        />
        <SuccessModal
          open={userStore.publishSubmitModalIsShowing}
          onClose={userStore.closePublishSubmitModal.bind(userStore)}
          title="Publishing Your Identity"
          content="Preparing your unique blockchain identity, this might take from a few seconds to a few minutes."
        />
        <SuccessModal
          open={userStore.startedAddingClaim && userStore.finishedAddingClaim}
          onClose={userStore.resetPublishClaim.bind(userStore)}
          title={t('publicationSuccessTitle')}
          content={t('publicationSuccessContent')}
        />
        <SuccessModal
          open={userStore.removeNotifyModalIsShowing}
          onClose={userStore.closeRemoveNotifyModal.bind(userStore)}
          title={t('Removing Your Identity')}
          content={t('Your claim is being removed from the blockchain, this usually takes from a few seconds to a few minutes.')}
        />
        
        <h1 className={classes.title}>My Identity</h1>
        <div className={classes.descriptionBox}>
          <p>This is your self-sovereign blockchain identity on Ethereum (ERC725). Only verification claims are public and stored on-chain.</p>
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
