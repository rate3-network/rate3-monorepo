import {
  configure,
  observable,
  action,
  computed,
  runInAction,
} from 'mobx';
import Web3 from 'web3';
import { ropsten, rinkeby, kovan, local, contractAddresses } from '../constants/addresses';
import { verifierPrivKey, managementAccountAddress } from '../constants/defaults';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class CommonStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable isUser: Boolean = true;
  @observable isUserOnboardDone: Boolean = false;
  @observable isVerifierOnboardDone: Boolean = false;
  @observable activeOnboardStep: Number = 1; // 1 - 3: Onboarding, 4: Homepage
  @observable currentLanguage: String = 'en';
  @observable commonNetwork: String = 'Kovan';
  // true: completed; false: not done;
  @observable shouldRenderOnboardTransition: Boolean = false;


  @observable isMetamaskEnabled = false;
  @observable isMetamaskSignedIn = false;
  @observable isOnTestNet = false;
  @observable hasTestEther = false;

  @observable metamaskAccount = '';
  @observable metamaskCurrentNetwork = '';
  @observable metamaskBalance = '';
  @observable accountUsedForDetectingChange = null;

  @observable fixedAccountBalance = '';
  // @observable shoudUseCommonNetwork: Boolean = false;
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
  }
  @computed get shouldUseCommonNetwork() {
    return !this.getIsUser() || (this.getIsUser() && this.rootStore.userStore.isOnFixedAccount);
  }
  @computed get isWalletSetupDone() {
    if (!this.getIsUser) {
      return true;
    }
    if (this.rootStore.userStore.isOnFixedAccount) {
      return true;
    }
    return this.isMetamaskEnabled && this.isMetamaskSignedIn && this.isOnTestNet && this.hasTestEther;
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
    switch (network) {
      case 'Ropsten':
        //do something
        break;
      case 'Ropsten':
        //do something
        break;
      case 'Ropsten':
        //do something
        break;
      default:
        //do something
    }
  }

  @action
  resetSetupWalletProgress() {
    this.isMetamaskEnabled = false;
    this.isMetamaskSignedIn = false;
    this.isOnTestNet = false;
    this.hasTestEther = false;
  }

  @action
  async initCommonNetwork() {
    this.rootStore.finishInitNetwork = false;
    // const web3 = new Web3(new Web3.providers.WebsocketProvider(ropsten.endpoint));
    const web3 = new Web3(kovan.endpoint);
    window.web3 = web3;
    if (typeof localStorage.commonNetwork !== 'undefined') {
      this.changeCommonNetwork(localStorage.commonNetwork);
    } else {
      this.changeCommonNetwork('Kovan');
    }

    const verifierBalance = await window.web3.eth.getBalance(managementAccountAddress);   
   
    runInAction(() => {
      const balance = window.web3.utils.fromWei(verifierBalance);
      this.rootStore.verifierStore.balanceToShow = balance;
    });


    const fixedAccountBalance = await window.web3.eth.getBalance(this.rootStore.userStore.fixedUserAddr);    

    try {
      runInAction(() => {
        this.fixedAccountBalance = fixedAccountBalance;
        this.fixedAccountBalance = window.web3.utils.fromWei(this.fixedAccountBalance);
        this.rootStore.globalSpinnerIsShowing = false;
        this.rootStore.finishInitNetwork = true;
      });
    } catch (err) {
      console.error(err);
    }
  }

  web3HasMetamaskProvider() {
    return (
      (window.web3.givenProvider !== null && typeof window.web3.givenProvider !== 'undefined' &&
        window.web3.givenProvider.isMetaMask === true) ||
      (window.web3.currentProvider !== null && typeof window.web3.currentProvider !== 'undefined' &&
        window.web3.currentProvider.isMetaMask === true));
  }


  @action
  async checkMetamaskNetwork() {
    this.resetSetupWalletProgress();
    if (this.getIsUser() && !this.rootStore.userStore.isOnFixedAccount) {
      if (typeof window.web3 !== 'undefined' && this.web3HasMetamaskProvider()) {
        this.isMetamaskEnabled = true;
      }
    } else {
      this.isMetamaskEnabled = false;
    }

    let web3;
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      window.web3 = web3;
      try {
        // Request account access if needed
        await window.ethereum.enable();
      } catch (error) {
        console.error(error);
      }
    } else if (window.web3.currentProvider !== null && window.web3.currentProvider.isMetaMask === true) {
      web3 = new Web3(window.web3.currentProvider);
    } else {
      web3 = new Web3(this.rootStore.browserProvider);
    }
    window.web3 = web3;

    try {
      const accounts = await window.web3.eth.getAccounts();
      if (accounts.length > 0) {
        runInAction(() => {
          this.isMetamaskSignedIn = true;
          [this.metamaskAccount] = accounts;
        });
      }
    } catch (err) {
      console.error('An error occurred while detecting MetaMask login status');
    }

    try {
      const networkType = await window.web3.eth.net.getNetworkType();
      runInAction(() => {
        switch (networkType) {
          case 'ropsten':
            this.metamaskCurrentNetwork = 'Ropsten';
            this.isOnTestNet = true;
            break;
          case 'rinkeby':
            this.metamaskCurrentNetwork = 'Rinkeby';
            this.isOnTestNet = true;
            break;
          case 'kovan':
            this.metamaskCurrentNetwork = 'Kovan';
            this.isOnTestNet = true;
            break;
          case 'private':
            this.metamaskCurrentNetwork = 'Private';
            this.isOnTestNet = true;
            break;
          default:
            this.metamaskCurrentNetwork = 'Other Net or';
        }
      });
    } catch (err) {
      console.error('An error occurred while detecting MetaMask network type');
    }


    try {
      const account = this.metamaskAccount;
      const balance = await window.web3.eth.getBalance(account);
      runInAction(() => {
        this.metamaskBalance = balance;
        this.metamaskBalance = window.web3.utils.fromWei(this.metamaskBalance);
        if (this.metamaskBalance > 0) {
          this.hasTestEther = true;
        }
      });
    } catch (err) {
      console.error('An error occurred while checking balance');
    }

    if (!window.web3.eth.givenProvider) return;
    window.web3.eth.givenProvider.publicConfigStore.on('update', (change) => {
      if (this.accountUsedForDetectingChange === null && change.selectedAddress !== '') {
        runInAction(() => {
          this.accountUsedForDetectingChange = change.selectedAddress;
        });
      } else if (this.accountUsedForDetectingChange !== change.selectedAddress) {
        window.location.reload();
      }
    });

    runInAction(() => { this.rootStore.finishInitMetamaskNetwork = true; this.rootStore.finishInitNetwork = true; });
  }
}

export default CommonStore;
