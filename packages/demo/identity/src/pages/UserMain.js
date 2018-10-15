import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import { when, runInAction } from 'mobx';
import { translate } from 'react-i18next';
import { withRouter, Route, Switch } from 'react-router-dom';

import { PENDING_REVIEW, PENDING_ADD, VERIFIED, PUBLISHING, REMOVING } from '../constants/general';
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
import InfoModal from '../components/InfoModal';

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
    this.props.RootStore.setStartInitNetworkTrue();
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
        const userAccount = this.props.RootStore.userStore.isOnFixedAccount ?
          this.props.RootStore.userStore.fixedUserAddr : this.props.RootStore.userStore.userAddr;

        const { nameClaimList, addressClaimList, socialIdClaimList, removalList, publishingList } = this.props.RootStore.userStore;
        const nameRemovalList = removalList.getNameClaimRemovals();
        const addressRemovalList = removalList.getAddressClaimRemovals();
        const socialIdRemovalList = removalList.getSocialIdClaimRemovals();

        const namePublishList = publishingList.getPendingAddNameClaimByAddrAndNetwork(userAccount, this.props.RootStore.currentNetwork);
        const addressPublishList = publishingList.getPendingAddAddressClaimByAddrAndNetwork(userAccount, this.props.RootStore.currentNetwork);
        const socialIdPublishList = publishingList.getPendingAddSocialIdClaimByAddrAndNetwork(userAccount, this.props.RootStore.currentNetwork);

        if (nameClaimList.length > 0) { // if claim is not empty, check if there are pending removal
          if (typeof nameRemovalList !== 'undefined' && nameRemovalList.length > 0) {
            const nameClaim = nameClaimList[0];
            const foundId = removalList.findIndexByClaim(nameClaim);
            if (typeof foundId === 'number' && foundId > -1) {
              this.pollForRemovalTransaction(removalList.getList()[foundId].hash, foundId);
              // set the claim status to pending removal / removing
              this.props.RootStore.userStore.setNameClaimToRemoving();
            }
          }
        } else { // if claim is empty, check if there are pending publish
          /* eslint no-lonely-if: off */
          if (typeof namePublishList !== 'undefined' && namePublishList.length > 0) {
            const nameClaim = namePublishList[0];
            const foundId = publishingList.findIndexByClaim(nameClaim.claim);
            this.pollForPublishTransaction(nameClaim.hash, foundId);
            const tempClaim = JSON.parse(JSON.stringify(nameClaim.claim));
            tempClaim.status = PUBLISHING;
            this.props.RootStore.userStore.addToNameClaimList(tempClaim);
          }
        }

        if (addressClaimList.length > 0) {
          if (typeof addressRemovalList !== 'undefined' && addressRemovalList.length > 0) {
            const addressClaim = addressClaimList[0];
            const foundId = removalList.findIndexByClaim(addressClaim);
            if (typeof foundId === 'number' && foundId > -1) {
              this.pollForRemovalTransaction(removalList.getList()[foundId].hash, foundId);
              this.props.RootStore.userStore.setAddressClaimToRemoving();
            }
          }
        } else { // if claim is empty, check if there are pending publish
          /* eslint no-lonely-if: off */
          if (typeof addressPublishList !== 'undefined' && addressPublishList.length > 0) {
            const addressClaim = addressPublishList[0];
            const foundId = publishingList.findIndexByClaim(addressClaim.claim);
            this.pollForPublishTransaction(addressClaim.hash, foundId);
            const tempClaim = JSON.parse(JSON.stringify(addressClaim.claim));
            tempClaim.status = PUBLISHING;
            this.props.RootStore.userStore.addToAddressClaimList(tempClaim);
          }
        }

        if (socialIdClaimList.length > 0) {
          if (typeof socialIdRemovalList !== 'undefined' && socialIdRemovalList.length > 0) {
            const nameClaim = socialIdClaimList[0];
            const foundId = removalList.findIndexByClaim(nameClaim);
            if (typeof foundId === 'number' && foundId > -1) {
              this.pollForRemovalTransaction(removalList.getList()[foundId].hash, foundId);
              // set the claim status to pending removal / removing
              this.props.RootStore.userStore.setSocialIdClaimToRemoving();
            }
          }
        } else { // if claim is empty, check if there are pending publish
          /* eslint no-lonely-if: off */
          if (typeof socialIdPublishList !== 'undefined' && socialIdPublishList.length > 0) {
            const socialIdClaim = socialIdPublishList[0];
            const foundId = publishingList.findIndexByClaim(socialIdClaim.claim);
            this.pollForPublishTransaction(socialIdClaim.hash, foundId);
            const tempClaim = JSON.parse(JSON.stringify(socialIdClaim.claim));
            tempClaim.status = PUBLISHING;
            this.props.RootStore.userStore.addToSocialIdClaimList(tempClaim);
          }
        }
      },
    );
  }
  /* eslint react/sort-comp: off */
  pollForRemovalTransaction(removalTxHash, id) {
    const checkTransactionStatus = async () => {
      const receipt = await window.web3.eth.getTransactionReceipt(removalTxHash);
      if (receipt !== null) {
        this.props.RootStore.userStore.removalList.deleteByIndex(id);
        if (receipt.status) { // if tx successful
          // modal: removed. refresh to see
          this.props.RootStore.modalStore.openInfoModal('Your Claim has been removed.');
          clearInterval(polling);
        } else { // if tx failed
          // delete from removalList
          clearInterval(polling);
        }
      }
    };
    let polling = setInterval(checkTransactionStatus, 1000);
  }
  /* eslint react/sort-comp: off */
  pollForPublishTransaction(publishTxHash, id) {
    const checkTransactionStatus = async () => {
      const receipt = await window.web3.eth.getTransactionReceipt(publishTxHash);
      if (receipt !== null) {
        this.props.RootStore.userStore.publishingList.deleteByIndex(id);
        if (receipt.status) { // if tx successful
          // modal: removed. refresh to see
          this.props.RootStore.modalStore.openInfoModal('Your Claim has been published.');
          clearInterval(polling);
        } else { // if tx failed
          // delete from removalList
          clearInterval(polling);
        }
      }
    };
    let polling = setInterval(checkTransactionStatus, 1000);
  }
  onRegisterSuccess() {
    this.props.RootStore.userStore.closeRegisterModal();

    const claimToStore = {
      status: PENDING_REVIEW,
      user: this.props.RootStore.userStore.isOnFixedAccount ?
        this.props.RootStore.userStore.fixedUserAddr :
        this.props.RootStore.userStore.userAddr,
      type: this.props.RootStore.userStore.formType,
      value: this.props.RootStore.userStore.getFormTextInputValue(),
      verifier: this.props.RootStore.userStore.getVerifierSelected(),
    };
    this.props.RootStore.userStore.db.addClaim(
      this.props.RootStore.userStore.getFormTextInputValue(),
      this.props.RootStore.userStore.formType,
      this.props.RootStore.userStore.isOnFixedAccount ?
        this.props.RootStore.userStore.fixedUserAddr :
        this.props.RootStore.userStore.userAddr,
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
          subText="Please Wait While Your Rate3 Identity Is Deploying"
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
          content={t('Your Verification Has Been Removed from the Blockchain. You Can View the Transaction in Metamask.')}
        />
        <PaymentModal
          open={paymentStore.paymentModalIsShowing}
        />
        <InfoModal />
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
          content="Publishing Your Identity Claim. This Might Take from a Few Seconds to a Few Minutes."
        />
        <SuccessModal
          open={userStore.removeNotifyModalIsShowing}
          // open={true}
          onClose={userStore.closeRemoveNotifyModal.bind(userStore)}
          title={t('Removing Your Identity')}
          content={t('Your Claim Is Being Removed from the Blockchain, This Usually Takes from a Few Seconds to a Few Minutes.')}
        />
        <SuccessModal
          open={userStore.startedAddingClaim && userStore.finishedAddingClaim}
          onClose={userStore.resetPublishClaim.bind(userStore)}
          title={t('publicationSuccessTitle')}
          content={t('publicationSuccessContent')}
        />
        

        <h1 className={classes.title}>My Identity</h1>
        <div className={classes.descriptionBox}>
          <p>This is your self-sovereign blockchain identity on Ethereum (ERC725). Only verification claims are public and stored on-chain.</p>
          {userStore.nameClaimList.length > 0 ?
            <ExpandablePanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Name" items={userStore.nameClaimList} /> :
            <FixedPanel
              isUser={this.props.RootStore.commonStore.getIsUser()}
              handleClick={() => { userStore.openRegisterModal('name'); }}
              title="Name"
            />
          }
          {userStore.addressClaimList.length > 0 ?
            <ExpandablePanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Address" items={userStore.addressClaimList} /> :
            <FixedPanel
              isUser={this.props.RootStore.commonStore.getIsUser()}
              handleClick={() => { userStore.openRegisterModal('address'); }}
              title="Address"
            />
          }
          {userStore.socialIdClaimList.length > 0 ?
            <ExpandablePanel isUser={this.props.RootStore.commonStore.getIsUser()} title="Social ID" items={userStore.socialIdClaimList} /> :
            <FixedPanel
              isUser={this.props.RootStore.commonStore.getIsUser()}
              handleClick={() => { userStore.openRegisterModal('socialId'); }}
              title="Social ID"
            />
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
