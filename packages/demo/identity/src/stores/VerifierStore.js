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

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class VerifierStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable userSelected: Number = null;
  @observable currentTab: Number = 0;
  @observable verifierModalIsShowing = true;
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
    this.db.approveClaim(this.currentVerification.user, this.currentVerification.value);
    this.setUserSelected(this.userSelected);
    this.openVerifySuccessModal();
    this.closeVerificationModal();
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
