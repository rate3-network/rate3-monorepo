import {
  configure,
  observable,
  action,
  computed,
  runInAction,
} from 'mobx';

import MyTable from '../utils/MyTable';
import Identity from '../utils/Identity';
import { PENDING_REVIEW, PENDING_ADD, VERIFIED } from '../constants/general';
import identityRegistryJson from '../build/contracts/IdentityRegistry.json';
import identityJson from '../build/contracts/Identity.json';
import { fixedVerifierRegistryContractAddr, dbPrefix, tableName, managementAccountAddress } from '../constants/defaults';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class VerifierStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable userSelected: String = null;
  @observable currentTab: Number = 0;
  @observable verifierModalIsShowing = false;
  @observable verifierModalHasBeenViewed = false;
  @observable modalPage: Number = 0;

  @observable verifierNetwork: String = 'verifier';

  @observable selectedUserNames: Array = [];
  @observable selectedUserAddresses: Array = [];
  @observable selectedUserSocialIds: Array = [];

  @observable verifyModalIsShowing = false;

  @observable currentVerification = [];
  @observable currentVerificationIndex = '';

  @observable verifySuccessModalIsShowing = false;

  @observable db = null;
  @observable nameClaimList = [];
  @observable addressClaimList = [];
  @observable socialIdClaimList = [];
  @observable pendingClaimList = [];

  @observable allUsersList = [];
  @observable currentSelectedUserNameList = [];
  @observable currentSelectedUserAddressList = [];
  @observable currentSelectedUserSocialIdList = [];

  // @observable verifierAddr = '0xE4Bfd8b40e78e539eb59719Ad695D0D0132FA502';
  verifierAddr = '0x05223E84769d33e75e692856216Ee881008d81FF'; // rinkeby

  // @observable verifierIdentityContractAddr = '0xfad46FBBeEa922c035D9EcED74B066510fD990b5';
  @observable verifierIdentityContractAddr = '0xeD976dc4DcE91321D9BB272380Bfa5b305823cB9'; // rinkeby

  // @observable registryContractAddr = '0x121159a9a1731fec0690ac92a448795ac3f5d97d';
  @observable registryContractAddr = fixedVerifierRegistryContractAddr;
  @observable registryContract = {};

  @observable identityContractAddr = '';
  @observable identityContract = {};

  @observable startedGettingClaim = false;
  @observable finishedGettingClaim = false;

  @observable balanceToShow = '';
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
    console.log('constructing verifier db');
    const myDb = new MyTable('rate3-test-v1', tableName);
    if (myDb.hasTable(tableName)) {
      myDb.getTable(tableName);
    } else {
      myDb.createTable();
    }
    runInAction(() => {
      this.db = myDb;
      console.log(this.db.getTable(tableName));
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
      console.log(this.db.getTable(tableName));
    });
  }
  @action
  resetClaimLists() {
    this.pendingClaimList = [];
    this.nameClaimList = [];
    this.addressClaimList = [];
    this.socialIdClaimList = [];
  }
  @action
  populateClaimLists() {
    console.log('populating verifier lists', this.db.getAllUnverifiedClaims());

    this.db.getAllUnverifiedClaims().forEach((claim) => { this.pendingClaimList.push(claim); });
    console.log('pendingClaimList', this.pendingClaimList);
    // this.db.getAllNameClaims().forEach((claim) => { this.pendingClaimList.push(claim); this.nameClaimList.push(claim); });
    // this.db.getAllAddressClaims().forEach((claim) => { this.pendingClaimList.push(claim); this.addressClaimList.push(claim); });
    // this.db.getAllSocialIdClaims().forEach((claim) => { this.pendingClaimList.push(claim); this.socialIdClaimList.push(claim); });
  }

  @action
  getRegistryContract() {
    const contract = new window.web3.eth.Contract(
      identityRegistryJson.abi,
      this.registryContractAddr,
    );
    this.registryContract = contract;
    window.registryContract = contract;
    return contract;
  }
  @action
  createIdentityContractFromAddress(addr) {
    const identityContract = new window.web3.eth.Contract(identityJson.abi, addr);
    window.identityContract = identityContract;
    runInAction(() => {
      this.identityContractAddr = addr;
      this.identityContract = identityContract;
    });
    return identityContract;
  }
  @action
  async getAllUsers() {
    const contract = this.getRegistryContract();
    try {
      const allIdentities = await contract.getPastEvents('NewIdentity', { fromBlock: 0, toBlock: 'latest' });
      const allIdentityList = allIdentities.map((event) => {
        return {
          identityAddr: event.returnValues.identityAddress,
          userAddr: event.returnValues.senderAddress,
        };
      });
      runInAction(() => { this.allUsersList = allIdentityList; });
    } catch (err) {
      this.rootStore.displayErrorModal('Encountered an error while getting identities for users.');
    }
  }

  @action
  async getIdentityForSelectedUser() {
    try {
      const idContractAddr = await this.registryContract.methods.identities(this.userSelected).call();
      const identityContract = new window.web3.eth.Contract(identityJson.abi, idContractAddr);
      window.identityContract = identityContract;
      runInAction(() => {
        this.identityContractAddr = idContractAddr;
        this.identityContract = identityContract;
      });
    } catch (err) {
      this.rootStore.displayErrorModal('Encountered an error while getting identity for the user selected.');
    }
  }

  @action
  async getAliveClaims() {
    try {
      const nameClaimArr = await this.identityContract.methods.getClaimIdsByTopic('101').call();
      const addressClaimArr = await this.identityContract.methods.getClaimIdsByTopic('102').call();
      const socialIdClaimArr = await this.identityContract.methods.getClaimIdsByTopic('103').call();

      const combined = { nameClaimArr, addressClaimArr, socialIdClaimArr };

      return new Promise((resolve) => {
        resolve(combined);
      });
    } catch (err) {
      this.rootStore.displayErrorModal('Encountered an error while getting past claims for user.');
    }
  }
  @action
  async populateWithValidClaims(userAddress) {
    runInAction(() => { this.startedGettingClaim = true; });
    let allAliveClaims;
    try {
      allAliveClaims = await this.getAliveClaims();
    } catch (err) {
      this.rootStore.displayErrorModal('Encountered an error while getting past claims for user.');
    }
    const { nameClaimArr, addressClaimArr, socialIdClaimArr } = allAliveClaims;
    let allEvents;
    try {
      allEvents = await this.identityContract.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' });
    } catch (err) {
      this.rootStore.displayErrorModal('Encountered an error while getting all past events for user.');
    }

    const addedAndChangedEvents = allEvents.filter((item) => { return item.event === 'ClaimAdded' || item.event === 'ClaimChanged'; });

    let data;
    if (nameClaimArr.length !== 0) {
      const validNameClaims = addedAndChangedEvents.filter((item) => { return item.returnValues.topic === '101'; });
      const validNameClaim = validNameClaims[validNameClaims.length - 1];

      data = window.web3.utils.hexToAscii(validNameClaim.returnValues.data);
      const claim = new Identity(data, 'name', userAddress, 'Verifier X', validNameClaim.returnValues.signature, validNameClaim.transactionHash, validNameClaim.returnValues.claimId, VERIFIED);
      runInAction(() => { this.selectedUserNames.push(claim); });
    }
    if (addressClaimArr.length !== 0) {
      const validNameClaims = addedAndChangedEvents.filter((item) => { return item.returnValues.topic === '102'; });
      const validNameClaim = validNameClaims[validNameClaims.length - 1];
      data = window.web3.utils.hexToAscii(validNameClaim.returnValues.data);
      const claim = new Identity(data, 'address', userAddress, 'Verifier X', validNameClaim.returnValues.signature, validNameClaim.transactionHash, validNameClaim.returnValues.claimId, VERIFIED);
      runInAction(() => { this.selectedUserAddresses.push(claim); });
    }
    if (socialIdClaimArr.length !== 0) {
      const validNameClaims = addedAndChangedEvents.filter((item) => { return item.returnValues.topic === '103'; });
      const validNameClaim = validNameClaims[validNameClaims.length - 1];
      data = window.web3.utils.hexToAscii(validNameClaim.returnValues.data);
      const claim = new Identity(data, 'socialId', userAddress, 'Verifier X', validNameClaim.returnValues.signature, validNameClaim.transactionHash, validNameClaim.returnValues.claimId, VERIFIED);
      runInAction(() => { this.selectedUserSocialIds.push(claim); });
    }
    runInAction(() => { this.finishedGettingClaim = true; });
  }
  @action
  resetGettingClaimStates() {
    this.startedGettingClaim = false;
    this.finishedGettingClaim = false;
  }
  getCurrentTab() {
    return this.currentTab;
  }
  getUserSelected() {
    return this.userSelected;
  }
  getModalPage() {
    return this.modalPage;
  }
  getVerifierModalIsShowing() {
    return this.verifierModalIsShowing;
  }
  @action
  openModal() {
    this.verifierModalIsShowing = true;
  }

  @action
  openVerificationModal() {
    this.verifyModalIsShowing = true;
  }
  @action
  closeVerificationModal() {
    this.verifyModalIsShowing = false;
  }

  // set the verification details on verification modal
  @action
  setCurrentVerification(user, value, type) {
    console.log('calling set current veri', user, value, type);
    console.log(this.pendingClaimList);
    const itemFound = this.pendingClaimList.find((item) => {
      return (item.user === user && item.value === value && item.type === type);
    });
    const indexFound = this.pendingClaimList.findIndex((item) => {
      return (item.user === user && item.value === value && item.type === type);
    });

    this.currentVerificationIndex = indexFound;
    this.currentVerification = itemFound;
  }

  @action
  approveCurrentVerification() {
    console.log('approiving');
    const itemFound = this.pendingClaimList.find((item) => {
      return (item.user === this.currentVerification.user &&
        item.value === this.currentVerification.value &&
        item.type === this.currentVerification.type);
    });
    const indexFound = this.pendingClaimList.findIndex((item) => {
      return (item.user === this.currentVerification.user &&
        item.value === this.currentVerification.value &&
        item.type === this.currentVerification.type);
    });
    itemFound.status = PENDING_ADD;
    console.log('line 266 pendingClaimList', this.pendingClaimList);
    this.pendingClaimList[indexFound] = itemFound;
    console.log('line 268 pendingClaimList', this.pendingClaimList);
    console.log('this.currentVerification.value ', this.currentVerification.value);
    const data = window.web3.utils.asciiToHex(this.currentVerification.value);
    console.log('data ', data);
    const issuerAddr = this.identityContractAddr;
    console.log('issuerAddr ', issuerAddr);
    let topic;
    if (this.currentVerification.type === 'name') topic = 101;
    if (this.currentVerification.type === 'address') topic = 102;
    if (this.currentVerification.type === 'socialId') topic = 103;
    console.log('topic ', topic);
    const dataToSign = window.web3.utils.soliditySha3(issuerAddr, topic, data);
    console.log('dataToSign ', dataToSign);
    let sig;
    window.web3.eth.sign(dataToSign, this.verifierAddr).then((str) => {
      sig = str;
      console.log('signature: ', str);
      console.log('Rate: VerifierStore -> approveCurrentVerification -> this.pendingClaimList', this.pendingClaimList);
      this.db.approveClaim(this.currentVerification.user, this.currentVerification.value, sig);
      this.setUserSelected(this.userSelected);
      console.log('Rate: VerifierStore -> approveCurrentVerification -> this.pendingClaimList', this.pendingClaimList);
      this.openVerifySuccessModal();
      this.closeVerificationModal();
    });
  }
  @action
  openVerifySuccessModal() {
    this.verifySuccessModalIsShowing = true;
  }
  @action
  closeVerifySuccessModal() {
    this.verifySuccessModalIsShowing = false;
  }
  @action
  closeModal() {
    this.verifierModalIsShowing = false;
    console.log(this.verifierModalIsShowing);
  }

  @action
  handleModalIndexChange(step) {
    this.modalPage = step;
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
  setUserSelected(user) {
    this.userSelected = user;
    this.resetUserSelectedLists();
    console.log('set user selected', this.userSelected);
    this.pendingClaimList.forEach((row) => {
      // const newId = new Identity(row.value, row.value, row.type, row.user, row.verifier, row.status);
      // console.log('newID', newId);
      if (row.user === user) {
        if (row.type === 'name') this.selectedUserNames.push(row);
        if (row.type === 'address') this.selectedUserAddresses.push(row);
        if (row.type === 'socialId') this.selectedUserSocialIds.push(row);
      }
    });
  }

  @action
  selectAndPopulateUserClaims(user, claims) {
    this.userSelected = user;
    claims.names.forEach((item) => { this.selectedUserNames.push(item); });
    claims.addresses.forEach((item) => { this.selectedUserAddresses.push(item); });
    claims.socialIds.forEach((item) => { this.selectedUserSocialIds.push(item); });
  }
  @action
  resetUserSelected(value) {
    this.userSelected = null;
    this.selectedUserNames = [];
    this.selectedUserAddresses = [];
    this.selectedUserSocialIds = [];
    console.log('resetUserSelected');
  }
  @action
  resetUserSelectedLists() {
    this.selectedUserNames = [];
    this.selectedUserAddresses = [];
    this.selectedUserSocialIds = [];
  }
  @action
  setCurrentTab(value) {
    this.currentTab = value;
  }
}

export default VerifierStore;
