import {
  configure,
  observable,
  action,
  runInAction,
} from 'mobx';

import Identity from '../utils/Identity';
import MyTable from '../utils/MyTable';
import LocalList from '../utils/LocalList';
import { VERIFIED, PUBLISHING, REMOVING } from '../constants/general';
import identityJson from '../build/contracts/Identity.json';
import { fixedUserAddress, fixedUserRegistryContractAddress, fixedVerifierIdentityContractAddress, dbPrefix, tableName } from '../constants/defaults';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class UserStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable userModalIsShowing = false;
  @observable userModalHasBeenViewed = false;
  @observable modalPage: Number = 0;

  @observable registerModalIsShowing = false;
  @observable registerSuccessModalIsShowing = false;
  // Modal Form
  @observable verifierList: Array = ['Verifier X'];
  @observable verifierSelected: String = '_placeholder_';
  @observable formTextInputValue: String = '';
  @observable formType: String = '';
  // Wallet properties
  @observable currentNetwork: String = 'Detecting Network...';
  @observable isMetaMaskLoggedIn: Boolean = false;
  // if on fixed account, use network settings from commonstore
  @observable isOnFixedAccount: Boolean = true;

  @observable fixedUserAcctNetwork: String = 'Ropsten';

  @observable metamaskAccount: String = '';
  @observable metamaskBalance: String = '';

  @observable registryContractAddr = fixedUserRegistryContractAddress;
  verifierIdentityContractAddr = fixedVerifierIdentityContractAddress;
  @observable identityContractAddr = '';
  @observable userAddr = '';
  @observable fixedUserAddr = fixedUserAddress;
  @observable doesIdentityExist = false;
  @observable registryContract = {};
  @observable identityContract = {};
  @observable identityAddress = '';

  @observable nameClaim = '';
  @observable addressClaim = '';
  @observable socialIdClaim = '';

  @observable db = null;
  @observable nameClaimList = [];
  @observable addressClaimList = [];
  @observable socialIdClaimList = [];

  @observable accountUsedForDetectingChange = null;

  @observable startedDeployingIdentity = false;
  @observable finishedDeployingIdentity = false;

  @observable startedLoadingClaims = false;
  @observable finishedLoadingClaims = false;

  @observable signature = '';
  @observable startedAddingClaim = false;
  @observable finishedAddingClaim = false;

  @observable reOnboardModalIsShowing = false;

  @observable startedRemovingClaim = false;
  @observable finishiedRemovingClaim = false;

  @observable removeNotifyModalIsShowing = false;
  @observable publishSubmitModalIsShowing = false;

  @observable removalList = [];
  @observable publishingList = [];
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
    localStorage.removeItem('rate3-test-v1.identity-demo');
    localStorage.removeItem('rate3-test-v2.identity-demo');
    localStorage.removeItem('rate3-test-v2.verified-user-list');
    const removalList = new LocalList(dbPrefix, 'removal-list');
    const publishingList = new LocalList(dbPrefix, 'publishing-list');
    const myDb = new MyTable(dbPrefix, tableName);
    if (myDb.hasTable(tableName)) {
      myDb.getTable(tableName);
    } else {
      myDb.createTable();
    }
    runInAction(() => {
      this.db = myDb;
      this.db.getTable(tableName);

      this.removalList = removalList;
      this.publishingList = publishingList;
    });
  }
  @action
  initDb() {
    const myDb = new MyTable(dbPrefix, tableName);
    if (myDb.hasTable(tableName)) {
      myDb.getTable(tableName);
    } else {
      myDb.createTable();
    }
    runInAction(() => {
      this.db = myDb;
      this.db.getTable(tableName);
    });
  }
  @action
  resetClaimLists() {
    this.nameClaimList = [];
    this.addressClaimList = [];
    this.socialIdClaimList = [];
  }
  @action
  populateClaimLists() {
    let userAddress = '';
    if (this.isOnFixedAccount) {
      userAddress = this.fixedUserAddr;
    } else {
      userAddress = this.userAddr;
    }
    //  && claim.network === this.rootStore.currentNetwork
    this.db.getAllNameClaims().forEach((claim) => {
      if (claim.user === userAddress && claim.network === this.rootStore.currentNetwork) this.nameClaimList.push(claim);
    });
    this.db.getAllAddressClaims().forEach((claim) => {
      if (claim.user === userAddress && claim.network === this.rootStore.currentNetwork) this.addressClaimList.push(claim);
    });
    this.db.getAllSocialIdClaims().forEach((claim) => {
      if (claim.user === userAddress && claim.network === this.rootStore.currentNetwork) this.socialIdClaimList.push(claim);
    });
  }
  @action
  resetPublishClaim() {
    this.startedAddingClaim = false;
    this.finishedAddingClaim = false;
  }
  @action
  changeToMetaMaskAccount() {
    this.isOnFixedAccount = false;
    window.localStorage.setItem('accountType', 'metamask');
    if (!this.rootStore.commonStore.isWalletSetupDone) this.rootStore.openReonboardModal();
  }
  @action
  changeToFixedAccount() {
    this.isOnFixedAccount = true;
    window.localStorage.setItem('accountType', 'fixed');
  }

  @action
  async getUserAddr() {
    const accounts = await window.web3.eth.getAccounts();
    try {
      if (accounts.length > 0) {
        runInAction(() => {
          [this.userAddr] = accounts;
        });
      }
    } catch (err) {
      this.rootStore.displayErrorModal('We have encountered an error while getting your Metamask account.');
    }
  }


  listenToNewIdentityEvent() {
    const checkNewIdentity = () => {
      this.registryContract.getPastEvents('NewIdentity', { fromBlock: 0, toBlock: 'latest' }, (error, events) => {
        if (error) {
          console.error(error);
          this.rootStore.displayErrorModal('Encountered an error while listening to new Identity events.');
        }
        if (events) {
          events.forEach((ev) => {
            if (ev.returnValues.senderAddress === this.userAddr) {
              runInAction(() => { this.finishedDeployingIdentity = true; });
              clearInterval(polling);
            }
          });
        }
      });
    };
    let polling = setInterval(checkNewIdentity, 1000);
  }

  listenToNewClaimEvent() {
    const checkNewClaim = () => {
      this.identityContract.getPastEvents('ClaimAdded', { fromBlock: 0, toBlock: 'latest' }, (error, events) => {
        if (error) {
          console.error(error);
          this.rootStore.displayErrorModal('Encountered an error while listening to new Claim events.');
        }
        if (events) {
          events.forEach((ev) => {
            if (ev.returnValues.signature === this.signature) {
              runInAction(() => { this.finishedAddingClaim = true; });
              this.resetClaimLists();
              this.getValidClaims();
              this.initDb();
              this.populateClaimLists();
              clearInterval(polling);
            }
          });
        }
      });
    };
    let polling = setInterval(checkNewClaim, 1000);
  }
  listenToNewClaimRemovedEvent(id, sig) {
    const checkNewClaimRemove = () => {
      this.identityContract.getPastEvents('ClaimRemoved', { fromBlock: 0, toBlock: 'latest' }, (error, events) => {
        if (error) {
          this.rootStore.displayErrorModal('Encountered an error while listening to new Removal events.');
          console.error(error);
        }
        if (events) {
          events.forEach((ev) => {
            if (ev.returnValues.claimId === id && ev.returnValues.signature === sig) {
              runInAction(() => { this.finishedRemovingClaim = true; });
              this.resetClaimLists();
              this.getValidClaims();
              this.initDb();
              this.populateClaimLists();
              clearInterval(polling);
            }
          });
        }
      });
    };
    let polling = setInterval(checkNewClaimRemove, 1000);
  }
  
  @action
  async getIdentityContractFromBlockchain() {
    runInAction(() => { this.startedLoadingClaims = true; });
    let userAddress = '';
    if (this.isOnFixedAccount) {
      userAddress = this.fixedUserAddr;
    } else {
      userAddress = this.userAddr;
    }
    const hasIdentity = await this.registryContract.methods.hasIdentity(userAddress).call();
    let idContractAddr = '';
    if (!hasIdentity) {
      runInAction(() => { this.startedDeployingIdentity = true; });
      this.listenToNewIdentityEvent();
      const identityAddrCreated = await this.registryContract.methods.createIdentity().send({ from: userAddress, gas: 6000000 });
      idContractAddr = identityAddrCreated;
    }
    if (hasIdentity) {
      idContractAddr = await this.registryContract.methods.identities(userAddress).call();
    }
    const identityContract = new window.web3.eth.Contract(identityJson.abi, idContractAddr);
    window.identityContract = identityContract;
    runInAction(() => {
      this.identityContract = identityContract;
      this.identityContractAddr = identityContract._address;
    });
    return new Promise((resolve) => {
      resolve(identityContract);
    });
  }
  @action
  async getAliveClaims() {
    await this.getIdentityContractFromBlockchain();
    const nameClaimArr = await this.identityContract.methods.getClaimIdsByTopic('101').call();
    const addressClaimArr = await this.identityContract.methods.getClaimIdsByTopic('102').call();
    const socialIdClaimArr = await this.identityContract.methods.getClaimIdsByTopic('103').call();

    const combined = { nameClaimArr, addressClaimArr, socialIdClaimArr };

    return new Promise((resolve) => {
      resolve(combined);
    });
  }
  @action
  async getValidClaims() {
    
    this.openLoadingClaimModal();
    const allAliveClaims = await this.getAliveClaims();
    const { nameClaimArr, addressClaimArr, socialIdClaimArr } = allAliveClaims;
    const allEvents = await this.identityContract.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' });
    const addedAndChangedEvents = allEvents.filter((item) => { return item.event === 'ClaimAdded' || item.event === 'ClaimChanged'; });

    let userAddress;
    if (this.isOnFixedAccount) {
      userAddress = this.fixedUserAddr;
    } else {
      userAddress = this.userAddr;
    }
    let data;
    if (nameClaimArr.length !== 0) {
      const validNameClaims = addedAndChangedEvents.filter((item) => { return item.returnValues.topic === '101'; });
      const validNameClaim = validNameClaims[validNameClaims.length - 1];

      data = window.web3.utils.hexToAscii(validNameClaim.returnValues.data);
      const claim = new Identity(data, 'name', userAddress, 'Verifier X', validNameClaim.returnValues.signature, validNameClaim.transactionHash, validNameClaim.returnValues.claimId, VERIFIED);
      const foundIndex = this.nameClaimList.findIndex((el) => { return el.txHash === claim.txHash; });
      if (foundIndex === -1) runInAction(() => { this.nameClaimList.push(claim); });
    }
    if (addressClaimArr.length !== 0) {
      const validNameClaims = addedAndChangedEvents.filter((item) => { return item.returnValues.topic === '102'; });
      const validNameClaim = validNameClaims[validNameClaims.length - 1];
      data = window.web3.utils.hexToAscii(validNameClaim.returnValues.data);
      const claim = new Identity(data, 'address', userAddress, 'Verifier X', validNameClaim.returnValues.signature, validNameClaim.transactionHash, validNameClaim.returnValues.claimId, VERIFIED);
      // only add it if it's not in the list
      const foundIndex = this.addressClaimList.findIndex((el) => { return el.txHash === claim.txHash; });
      if (foundIndex === -1) runInAction(() => { this.addressClaimList.push(claim); });
    }
    if (socialIdClaimArr.length !== 0) {
      const validNameClaims = addedAndChangedEvents.filter((item) => { return item.returnValues.topic === '103'; });
      const validNameClaim = validNameClaims[validNameClaims.length - 1];
      data = window.web3.utils.hexToAscii(validNameClaim.returnValues.data);
      const claim = new Identity(data, 'socialId', userAddress, 'Verifier X', validNameClaim.returnValues.signature, validNameClaim.transactionHash, validNameClaim.returnValues.claimId, VERIFIED);
      const foundIndex = this.socialIdClaimList.findIndex((el) => { return el.txHash === claim.txHash; });
      if (foundIndex === -1) runInAction(() => { this.socialIdClaimList.push(claim); });
    }

    this.closeLoadingClaimModal();
  }

  @action
  addClaim(item, gasPrice) {
    let userAddress = '';
    if (this.isOnFixedAccount) {
      userAddress = this.fixedUserAddr;
    } else {
      userAddress = this.userAddr;
    }
    const claim = item.value;
    const data = window.web3.utils.asciiToHex(claim);
    const addr = userAddress;
    let topic;
    if (item.type === 'name') topic = 101;
    if (item.type === 'address') topic = 102;
    if (item.type === 'socialId') topic = 103;

    const location = 'some location';
    const sig = item.signature;
    this.signature = sig;
    this.startedAddingClaim = true;
    this.listenToNewClaimEvent();
    if (!this.isOnFixedAccount) {
      window.identityContract.methods.addClaim(topic, 1, this.verifierIdentityContractAddr, this.signature, data, location)
        .send(
          { from: userAddress, gas: 500000 },
          (err, result) => {
            if (err) {
              console.error(err);
              this.rootStore.displayErrorModal('Encountered an error while adding your Claim to the blockchain. It might be caused by a pending transaction. You can try with a higher gas price.');
            }
            if (result) {
              this.publishingList.push(result, this.rootStore.currentNetwork, item);
              this.openPublishSubmitModal();
              this.db.deleteClaim(addr, claim);
            }
          },
        );
    } else {
      window.identityContract.methods.addClaim(topic, 1, this.verifierIdentityContractAddr, sig, data, location)
        .send(
          { from: userAddress, gas: 500000, gasPrice: this.rootStore.paymentStore.gasPriceInWei },
          (err, result) => {
            if (err) {
              console.error(err);
              this.rootStore.displayErrorModal('Encountered an error while adding your Claim to the blockchain. It might be caused by a pending transaction. You can try with a higher gas price.');
            }
            if (result) {
              this.publishingList.push(result, this.rootStore.currentNetwork, item);
              this.openPublishSubmitModal();
              this.db.deleteClaim(addr, claim);
            }
          },
        );
    }
  }
  @action
  removeClaim(item) {
    this.startedRemovingClaim = true;
    this.listenToNewClaimRemovedEvent(item.claimId, item.signature);
    window.identityContract.methods.removeClaim(item.claimId).send(
      {
        from: this.isOnFixedAccount ?
          this.fixedUserAddr :
          this.userAddr,
        gas: 6000000,
        gasPrice: '5000000000',
      },
      (err, result) => {
        if (err) {
          console.error(err);
          this.rootStore.displayErrorModal('Encountered an error while removing your Claim.');
        }
        if (result) {
          this.removalList.push(result, this.rootStore.currentNetwork, item);
        }
      },
    );
  }
  @action
  openLoadingClaimModal() {
    this.startedLoadingClaims = true;
    this.finishedLoadingClaims = false;
  }
  @action
  closeLoadingClaimModal() {
    this.startedLoadingClaims = true;
    this.finishedLoadingClaims = true;
  }
  @action
  listenToMetaMaskAccountChange() {
    if (!window.web3.eth.givenProvider) return;
    window.web3.eth.givenProvider.publicConfigStore.on('update', (change) => {
      if (this.accountUsedForDetectingChange === null) {
        runInAction(() => {
          this.accountUsedForDetectingChange = change.selectedAddress;
        });
      } else if (this.accountUsedForDetectingChange !== change.selectedAddress) {
        window.location.reload();
      }
    });
  }

  getFormTextInputValue() {
    return this.formTextInputValue;
  }
  getVerifierSelected() {
    return this.verifierSelected;
  }
  getVerifierList() {
    return this.verifierList;
  }

  getModalPage() {
    return this.modalPage;
  }

  getUserModalIsShowing() {
    return this.userModalIsShowing;
  }

  getRegisterModalIsShowing() {
    return this.registerModalIsShowing;
  }
  getRegisterSuccessModalIsShowing() {
    return this.registerSuccessModalIsShowing;
  }

  @action
  openModal() {
    this.userModalIsShowing = true;
  }

  @action
  closeModal() {
    this.userModalIsShowing = false;
  }

  @action
  handleModalIndexChange(step) {
    this.modalPage = step;
  }
  @action
  openRemoveNotifyModal() {
    this.removeNotifyModalIsShowing = true;
  }
  @action
  closeRemoveNotifyModal() {
    this.removeNotifyModalIsShowing = false;
  }
  @action
  handleModalNext() {
    this.modalPage += 1;
  }
  @action
  handleModalBack() {
    this.modalPage -= 1;
  }
  @action
  openRegisterModal(name) {
    this.registerModalIsShowing = true;
    this.formType = name;
  }
  @action
  closeRegisterModal() {
    this.registerModalIsShowing = false;
  }
  @action
  openRegisterSuccessModal() {
    this.registerSuccessModalIsShowing = true;
  }
  @action
  closeRegisterSuccessModal() {
    this.registerSuccessModalIsShowing = false;
  }
  @action
  setVerifierSelected(v) {
    this.verifierSelected = v;
  }
  @action
  setFormTextInputValue(v) {
    this.formTextInputValue = v;
  }
  @action
  resetRegistrationForm() {
    this.formTextInputValue = '';
    this.verifierSelected = '_placeholder_';
  }
  @action
  setFormType(type) {
    this.formType = type;
  }
  @action
  openReOnboardModal() {
    this.reOnboardModalIsShowing = true;
  }
  @action
  openPublishSubmitModal() {
    this.publishSubmitModalIsShowing = true;
  }
  @action
  closePublishSubmitModal() {
    this.publishSubmitModalIsShowing = false;
  }
  @action
  setNameClaimToRemoving() {
    const copy = this.nameClaimList.slice();
    copy[0].status = REMOVING;
    this.nameClaimList = copy;
  }
  @action
  setAddressClaimToRemoving() {
    const copy = this.addressClaimList.slice();
    copy[0].status = REMOVING;
    this.addressClaimList = copy;
  }
  @action
  setSocialIdClaimToRemoving() {
    const copy = this.socialIdClaimList.slice();
    copy[0].status = REMOVING;
    this.socialIdClaimList = copy;
  }
}
export default UserStore;
