import {
  configure,
  observable,
  action,
  computed,
  autorun,
  runInAction,
} from 'mobx';
import Web3 from 'web3';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class CommonStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable isUser: Boolean = true;
  @observable isUserOnboardDone: Boolean = false;
  @observable isVerifierOnboardDone: Boolean = false;
  @observable activeOnboardStep: Number = 1; // 1 - 3: Onboarding, 4: Homepage
  @observable currentLanguage: String = 'en';
  @observable currentNetwork: String = 'Detecting Network...';
  // true: completed; false: not done;
  @observable setupWalletProgress: Array = [true, true, true, true];
  @observable shouldRenderOnboardTransition: Boolean = false;
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  getMetamaskNetwork = autorun(() => {
    const web3 = new Web3(Web3.givenProvider);
    window.web3 = web3;
    web3.eth.net.getNetworkType((err, network) => {
      runInAction(() => {
        switch (network) {
          case 'ropsten':
            this.currentNetwork = 'Ropsten Test Network';
            return;
          case 'rinkeby':
            this.currentNetwork = 'Rinkeby Test Network';
            return;
          case 'kovan':
            this.currentNetwork = 'Kovan Test Network';
            return;
          default:
            this.currentNetwork = 'Please Use a Test Network';
        }
      });
    });
  });

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

  getCurrentNetwork() {
    return this.currentNetwork;
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

  @action
  setCurrentNetwork(network) {
    this.currentNetwork = network;
  }
}

export default CommonStore;
