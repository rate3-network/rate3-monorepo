import {
  configure,
  observable,
  action,
  computed,
} from 'mobx';

import { PENDING, VERIFIED } from '../constants/general';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class UserStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable identityNames: Array = [{
    id: 0,
    status: VERIFIED,
    value: 'John Snow',
    txHash: '0x825e1e0c57700b327dff98d2b04b17ba8fe3d2ea729acd79a4d2fe1a2912935b',
    signature: '0x4d3a5de2bfa0bb3d35fecd82d6d3c1deb396580f',
  }];
  @observable identityAddresses: Array = [{
    id: 0,
    status: VERIFIED,
    value: '123 Ochard Road',
    txHash: '0x825e1e0c57700b327dff98d2b04b17ba8fe3d2ea729acd79a4d2fe1a2912935b',
    signature: '0x4d3a5de2bfa0bb3d35fecd82d6d3c1deb396580f',
  }, { id: 1, status: PENDING, value: '001 Changi Road' }];
  @observable identitySocialIds: Array = [];
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

  @action
  addToNames(name) {
    const id = this.identityNames.length;
    const newIdentityName = {
      id,
      status: PENDING,
      value: name,
    };
    this.identityNames.push(newIdentityName);
  }
}

export default UserStore;
