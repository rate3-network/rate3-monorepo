import {
  configure,
  observable,
  action,
  computed,
} from 'mobx';
import Web3 from 'web3';
import { ropsten, rinkeby, kovan, contractAddresses } from '../constants/addresses';
import { verifierPrivKey } from '../constants/defaults';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class CommonStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable isUser: Boolean = true;
  @observable isUserOnboardDone: Boolean = false;
  @observable isVerifierOnboardDone: Boolean = false;
  @observable activeOnboardStep: Number = 1; // 1 - 3: Onboarding, 4: Homepage
  @observable currentLanguage: String = 'en';
  @observable commonNetwork: String = 'Rinkeby';
  // true: completed; false: not done;
  @observable setupWalletProgress: Array = [false, false, false, false];
  @observable shouldRenderOnboardTransition: Boolean = false;

  // @observable shoudUseCommonNetwork: Boolean = false;
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
  }
  @computed get shouldUseCommonNetwork() {
    return !this.getIsUser() || (this.getIsUser() && this.rootStore.userStore.isOnFixedAccount);
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

  getCommonNetwork() {
    return this.commonNetwork;
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
  changeCommonNetwork(network) {
    this.commonNetwork = network;
    window.web3.setProvider(contractAddresses[network].endpoint);
    window.localStorage.setItem('commonNetwork', this.commonNetwork);
  }

  @action
  resetSetupWalletProgress() {
    this.setupWalletProgress = [false, false, false, false];
  }

  @action
  completeSetupWallet() {
    console.error('comletinggggg');
    this.setupWalletProgress = [true, true, true, true];
  }

  @action
  initCommonNetwork() {
    console.log('init common network');
    const web3 = new Web3(ropsten.endpoint);
    window.web3 = web3;
    console.log(`web3js version: ${window.web3.version}`);
    if (typeof localStorage.commonNetwork !== 'undefined') {
      this.changeCommonNetwork(localStorage.commonNetwork);
    } else {
      this.changeCommonNetwork('Ropsten');
    }
    this.setupWalletProgress = [true, true, true, true];

  }
}

export default CommonStore;
