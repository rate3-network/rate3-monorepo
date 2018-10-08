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
import { deflateRawSync } from 'zlib';

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
    this.pendingClaimList = [];
    this.nameClaimList = [];
    this.addressClaimList = [];
    this.socialIdClaimList = [];
  }
  @action
  populateClaimLists() {
    this.db.getAllUnverifiedClaims().forEach((claim) => { this.pendingClaimList.push(claim); });
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
  async createIdentityContractFromUserAddress(addr) {
    const userIdentityContractAddress = await window.registryContract.methods.identities(addr).call();
    const identityContract = new window.web3.eth.Contract(identityJson.abi, userIdentityContractAddress);
    window.identityContract = identityContract;
    runInAction(() => {
      this.identityContractAddr = addr;
      this.identityContract = identityContract;
    });
    return new Promise((resolve) => {
      resolve(identityContract);
    });
  }
  @action
  async getAllUsers() {
    this.getRegistryContract();
    const rawVerifiedUserList = JSON.parse(window.localStorage.getItem(`${dbPrefix}.verified-user-list`));
    const unique = [...new Set(rawVerifiedUserList)];
    const verifiedUserList = [];
    unique.forEach((user) => {
      verifiedUserList.push({ userAddr: user });
    });
    this.allUsersList = verifiedUserList;
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
    let combined;
    try {
      const nameClaimArr = await this.identityContract.methods.getClaimIdsByTopic('101').call();
      const addressClaimArr = await this.identityContract.methods.getClaimIdsByTopic('102').call();
      const socialIdClaimArr = await this.identityContract.methods.getClaimIdsByTopic('103').call();
      combined = { nameClaimArr, addressClaimArr, socialIdClaimArr };
    } catch (err) {
      this.rootStore.displayErrorModal('Encountered an error while getting past claims for user.');
    }
    return new Promise((resolve) => {
      resolve(combined);
    });
  }

  @action
  async populateWithValidClaims(userAddress) {
    runInAction(() => { this.startedGettingClaim = true; });
    await this.createIdentityContractFromUserAddress(userAddress);
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
    this.pendingClaimList[indexFound] = itemFound;
    const data = window.web3.utils.asciiToHex(this.currentVerification.value);
    const issuerAddr = this.identityContractAddr;
    let topic;
    if (this.currentVerification.type === 'name') topic = 101;
    if (this.currentVerification.type === 'address') topic = 102;
    if (this.currentVerification.type === 'socialId') topic = 103;
    const dataToSign = window.web3.utils.soliditySha3(issuerAddr, topic, data);
    let sig;
    window.web3.eth.sign(dataToSign, this.verifierAddr).then((str) => {
      sig = str;
      this.db.approveClaim(this.currentVerification.user, this.currentVerification.value, sig);
      this.setUserSelected(this.userSelected);
      this.openVerifySuccessModal();
      this.closeVerificationModal();
    });

    if (window.localStorage.getItem(`${dbPrefix}.verified-user-list`) === null) {
      window.localStorage.setItem(`${dbPrefix}.verified-user-list`, []);
    }
    let verifiedUserList = [];
    if (window.localStorage.getItem(`${dbPrefix}.verified-user-list`) === '') {
      verifiedUserList = [];
    } else {
      verifiedUserList = JSON.parse(window.localStorage.getItem(`${dbPrefix}.verified-user-list`));
    }
    verifiedUserList.push(this.currentVerification.user);
    window.localStorage.setItem(`${dbPrefix}.verified-user-list`, JSON.stringify(verifiedUserList));
  }
  @action
  openVerifySuccessModal() {
    this.verifySuccessModalIsShowing = true;
  }
  @action
  closeVerifySuccessModal() {
    this.verifySuccessModalIsShowing = false;
    window.location.reload();
  }
  @action
  closeModal() {
    this.verifierModalIsShowing = false;
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
    this.pendingClaimList.forEach((row) => {
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
