import {
  configure,
  observable,
  action,
} from 'mobx';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class CommonStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable isUser: Boolean = true;
  @observable isSetupDone: Boolean = false;
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  /* ************* Getters *************  */
  /**
   * Gets the role of user
   *
   * @returns {Boolean} True if is User, false if is Verifier
   * @memberof CommonStore
   */

  getIsUser() {
    return this.isUser;
  }

  /* ************* Getters *************  */
  /**
   * Gets the status of setup
   *
   * @returns {Boolean} True if done, false otherwise
   * @memberof CommonStore
   */

  getIsSetupDone() {
    return this.isSetupDone;
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

  /**
   * Change Setup status to done
   *
   * @returns {null} null
   * @memberof CommonStore
   */
  @action
  finishSetup() {
    this.isSetupDone = true;
  }
}

export default CommonStore;