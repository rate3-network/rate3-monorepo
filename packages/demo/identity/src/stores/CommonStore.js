import {
  configure,
  observable,
  action,
  runInAction,
} from 'mobx';

configure({ enforceActions: 'strict' }); // don't allow state modifications outside actions

class CommonStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable isUser: Boolean = true;
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  /* ************* Getters *************  */
  /**
   * Gets the role of user
   *
   * @returns {Boolean} If is User
   * @memberof CommonStore
   */

  getIsUser() {
    return this.isUser;
  }

  /**
   * Change role to Verifier
   *
   * @returns {null} null
   * @memberof CommonStore
   */
  @action
  changeToVerifier() {
    this.isUser = false;
  }

  /**
   * Change role to User
   *
   * @returns {null} null
   * @memberof CommonStore
   */
  @action
  changeToUser() {
    this.isUser = true;
  }
}

export default CommonStore;
