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
class UserStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable userModalIsShowing = true;
  @observable userModalHasBeenViewed = false;
  @observable identityNames: Array = [];
  @observable identityAddresses: Array = [{ id: 1, status: PENDING_REVIEW, value: '001 Changi Road' }];
  @observable identitySocialIds: Array = [social1, social2, social3];
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  getIdentityNames() {
    return this.identityNames;
  }
  getIdentityAddresses() {
    return this.identityAddresses;
  }
  getIdentitySocialIds() {
    return this.identitySocialIds;
  }

  getUserModalIsShowing() {
    return this.userModalIsShowing;
  }

  @action
  addToNames(name) {
    const id = this.identityNames.length;
    const newIdentityName = {
      id,
      status: PENDING_ADD,
      value: name,
    };
    this.identityNames.push(newIdentityName);
  }

  @action
  openModal() {
    this.userModalIsShowing = true;
  }

  @action
  closeModal() {
    this.userModalIsShowing = false;
    console.log(this.userModalIsShowing);
  }
}

export default UserStore;
