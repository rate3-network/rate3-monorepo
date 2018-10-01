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

  // @observable verifierAddr = '0xE4Bfd8b40e78e539eb59719Ad695D0D0132FA502';
  verifierAddr = '0x05223E84769d33e75e692856216Ee881008d81FF'; // rinkeby

  // @observable verifierIdentityContractAddr = '0xfad46FBBeEa922c035D9EcED74B066510fD990b5';
  @observable verifierIdentityContractAddr = '0xeD976dc4DcE91321D9BB272380Bfa5b305823cB9'; // rinkeby

  // @observable registryContractAddr = '0x121159a9a1731fec0690ac92a448795ac3f5d97d';
  @observable registryContractAddr = '0x04bb4bc5bced9d93b7bc98cf7e092469d5920a4a'; // rinkeby
  @observable registryContract = {};

  @observable identityContractAddr = '';
  @observable identityContract = {};
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
    console.log('constructing verifier db');
    const myDb = new MyTable('rate3', 'identity-demo');
    if (myDb.hasTable('identity-demo')) {
      myDb.getTable('identity-demo');
    } else {
      myDb.createTable();
    }
    runInAction(() => {
      this.db = myDb;
      console.log(this.db.getTable('identity-demo'));
    });
  }

  @action
  initDb() {
    const myDb = new MyTable('rate3', 'identity-demo');
    if (myDb.hasTable('identity-demo')) {
      myDb.getTable('identity-demo');
    } else {
      myDb.createTable();
    }
    runInAction(() => {
      this.db = myDb;
      console.log(this.db.getTable('identity-demo'));
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
    console.log('from localdb', JSON.parse(window.localStorage['rate3.identity-demo']));
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
  }

  @action
  async getIdentityForSelectedUser() {
    const idContractAddr = await this.registryContract.methods.identities(this.userSelected).call();
    const identityContract = new window.web3.eth.Contract(identityJson.abi, idContractAddr);
    window.identityContract = identityContract;
    runInAction(() => {
      this.identityContractAddr = idContractAddr;
      this.identityContract = identityContract;
    });
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
    this.pendingClaimList[indexFound] = itemFound;
    console.log('line 128 pendingClaimList', this.pendingClaimList);

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
      this.db.approveClaim(this.currentVerification.user, this.currentVerification.value, sig);
      this.setUserSelected(this.userSelected);
      this.openVerifySuccessModal();
      this.closeVerificationModal();
    });
    // 0xc85e6185ea29c7e8baccc64ac99ebdd288650e6262d978f02b21cb57f209cbe33665893cc02733f4a5f5075bd653f623c815225a36e6265dacc3c5dd850d728401
    // 0xc85e6185ea29c7e8baccc64ac99ebdd288650e6262d978f02b21cb57f209cbe33665893cc02733f4a5f5075bd653f623c815225a36e6265dacc3c5dd850d72841c
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
  resetUserSelected(value) {
    this.userSelected = null;
    this.selectedUserNames = [];
    this.selectedUserAddresses = [];
    this.selectedUserSocialIds = [];
    console.log('resetUserSelected');
  }
  @action
  setCurrentTab(value) {
    this.currentTab = value;
  }
}

export default VerifierStore;
