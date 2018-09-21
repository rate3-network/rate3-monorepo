import {
  configure,
  observable,
  action,
  computed,
} from 'mobx';

import Identity from '../utils/Identity';
import { PENDING_REVIEW, PENDING_ADD, VERIFIED } from '../constants/general';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

const social1 = new Identity(0, 'S1234568G');
const social2 = new Identity(1, 'G01293849I');
const social3 = new Identity(1, 'S09898376Y');
social2.approveIdentity('0x4d3a5de2bfa0bb3d35fecd82d6d3c1deb396580f');
social3.approveIdentity('0x4d3a5de2bfa0bb3d35fecd82d6d3c1deb396580f');
social3.addIdentity('0x825e1e0c57700b327dff98d2b04b17ba8fe3d2ea729acd79a4d2fe1a2912935b');
class VerifierStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable userSelected: Number = null;
  @observable currentTab: Number = 0;
  @observable verifierModalIsShowing = true;
  @observable verifierModalHasBeenViewed = false;
  @observable modalPage: Number = 0;

  @observable verifierNetwork: String = 'verifier';

  @observable identityTable: Array = [];

  @observable pendingIdentityList: Array = [];
  @observable verifiedIdentityList: Array = [];

  @observable selectedUserNames: Array = [];
  @observable selectedUserAddresses: Array = [];
  @observable selectedUserSocialIds: Array = [];

  @observable verifyModalIsShowing = false;

  @observable currentVerification = [];
  @observable currentVerificationIndex = '';

  @observable verifySuccessModalIsShowing = false;
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
    console.log('verifier store constructed');
  }
  @action
  setIdentityTable(table) {
    console.log('setting table for verifier');
    this.identityTable = table;
    this.pendingIdentityList = [];
    this.verifiedIdentityList = [];
    table.forEach((row) => {
      if (row.status === PENDING_REVIEW) {
        console.log('pending review', row);
        const claim = new Identity(row.value, row.value, row.type, row.user, row.verifier, row.status);
        this.pendingIdentityList.push(claim);
      }
      if (row.status === VERIFIED || row.status === PENDING_ADD) {
        console.log('not pending review', row);
        const claim = new Identity(row.value, row.value, row.type, row.user, row.verifier, row.status);
        this.verifiedIdentityList.push(claim);
      }
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
  @action
  setCurrentVerification(user, value, type) {
    let table = this.identityTable;
    let itemFound = table.find((item) => {
      return (item.user === user && item.value === value && item.type === type);
    });
    let indexFound = table.findIndex((item) => {
      return (item.user === user && item.value === value && item.type === type);
    });
    // // itemFound.status = PENDING_ADD;
    // table[indexFound] = itemFound;
    // localStorage.setItem('table', JSON.stringify(table));
    this.currentVerificationIndex = indexFound;
    this.currentVerification = itemFound;
  }

  @action
  approveCurrentVerification() {
    this.currentVerification.status = PENDING_ADD;
    console.log('currentVerification', this.currentVerification);
    let table = this.identityTable;
    table[this.currentVerificationIndex] = this.currentVerification;
    localStorage.setItem('table', JSON.stringify(table));
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
  setUserSelected(value) {
    this.userSelected = value;
    this.identityTable.forEach((row) => {
      const newId = new Identity(row.value, row.value, row.type, row.user, row.verifier, row.status);
      console.log('newID', newId);
      if (row.type === 'name') this.selectedUserNames.push(newId);
      if (row.type === 'address') this.selectedUserAddresses.push(newId);
      if (row.type === 'socialId') this.selectedUserSocialIds.push(newId);
    })
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
