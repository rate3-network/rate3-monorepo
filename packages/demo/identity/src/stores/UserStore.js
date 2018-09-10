import {
  configure,
  observable,
  action,
  computed,
} from 'mobx';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class UserStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable identityNames: Array = [];
  @observable identityAddresses: Array = [];
  @observable identitySocialIds: Array = [];
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  addToNames(name) {
    const id = this.identityNames.length;
    const identityName = {
      id,
      status: 'pending',
      value: name,
    };
    this.identityNames.push(identityName);
  }
}

export default UserStore;
