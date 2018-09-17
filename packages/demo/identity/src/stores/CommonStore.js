import {
  configure,
  observable,
  action,
  computed,
  autorun,
  when,
  runInAction,
} from 'mobx';


configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class CommonStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable isUser: Boolean = true;
  @observable isUserOnboardDone: Boolean = false;
  @observable isVerifierOnboardDone: Boolean = false;
  @observable activeOnboardStep: Number = 1; // 1 - 3: Onboarding, 4: Homepage
  @observable currentLanguage: String = 'en';
  // true: completed; false: not done;
  @observable setupWalletProgress: Array = [false, false, false, false];
  @observable shouldRenderOnboardTransition: Boolean = false;

  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
  }


  @computed get isWalletSetupDone() {
    return this.setupWalletProgress.every(progress => (progress)); // check if every step is done
  }

  // @computed get isOnboardDone() {
  //   return this.isOnboardDone
  // }

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

  getIsUserOnboardDone() {
    return this.isUserOnboardDone;
  }

  getIsVerifierOnboardDone() {
    return this.isVerifierOnboardDone;
  }

  getShouldRenderOnboardTransition() {
    return this.shouldRenderOnboardTransition;
  }

  getActiveOnboardStep() {
    return this.activeOnboardStep;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }


  getSetupWalletProgress(id) {
    return this.setupWalletProgress[id];
  }
  /**
   * Change role to Verifier
   *
   * @returns {null} null
   * @memberof CommonStore
   */
  @action
  changeToVerifier() {
    this.setTrueShouldRenderOnboardTransition();
    this.isUser = false;
    window.localStorage.setItem('isUser', this.isUser);
  }

  /**
   * Change role to User
   *
   * @returns {null} null
   * @memberof CommonStore
   */
  @action
  changeToUser() {
    this.setTrueShouldRenderOnboardTransition();
    this.isUser = true;
    window.localStorage.setItem('isUser', this.isUser);
  }

  @action
  toggleRole() {
    this.isUser = !this.isUser;
    window.localStorage.setItem('isUser', this.isUser);
  }
  /**
   * Change Setup status to done
   *
   * @returns {null} null
   * @memberof CommonStore
   */
  @action
  finishUserOnboard() {
    this.isUserOnboardDone = true;
    window.localStorage.setItem('isUserOnboardDone', true);
  }

  @action
  finishVerifierOnboard() {
    this.isVerifierOnboardDone = true;
    window.localStorage.setItem('isVerifierOnboardDone', true);
  }

  @action
  onboardNextStep() {
    this.activeOnboardStep += 1;
  }

  @action
  setCurrentLanguage(l) {
    this.currentLanguage = l;
  }

  @action
  completeSetupWalletProgress(id) {
    console.log('complete ' + id);
    this.setupWalletProgress[id] = true;
  }

  @action
  setTrueShouldRenderOnboardTransition() {
    this.shouldRenderOnboardTransition = true;
  }
  @action
  setFalseShouldRenderOnboardTransition() {
    this.shouldRenderOnboardTransition = false;
  }

  @action
  goToLastOnboardStep() {
    this.activeOnboardStep = 3;
  }

}

export default CommonStore;
