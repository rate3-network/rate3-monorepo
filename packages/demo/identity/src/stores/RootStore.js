/* Root store that contains all domain stores */
import {
  computed,
  observable,
  action,
  when,
} from 'mobx';

import CommonStore from './CommonStore';
import UserStore from './UserStore';
import VerifierStore from './VerifierStore';
import { userPrivKey, verifierPrivKey } from '../constants/defaults';

class RootStore {
  constructor() {
    
  }
  @observable commonStore = new CommonStore(this);
  @observable userStore = new UserStore(this);
  @observable verifierStore = new VerifierStore(this);

  @observable browserProvider = null;

  @observable globalSpinnerIsShowing: Boolean = false;

  @observable finishInitNetwork: Boolean = false;
  @computed get currentNetwork() {
    if (this.commonStore.getIsUser()) {
      if (!this.userStore.isOnFixedAccount) return this.userStore.currentNetwork;
      return this.commonStore.commonNetwork;
    }
    return this.commonStore.commonNetwork;
  }

  @action
  initNetwork() {
    this.globalSpinnerIsShowing = true;
    // for user using own account, must detect metamask first
    if (this.commonStore.getIsUser()) {
      if (typeof window.web3 === 'undefined') {
        console.error('no web3 is installed or metamask not enabled');
        return;
      }
    }
    if (typeof window.web3 !== 'undefined' && window.web3.currentProvider.isMetaMask === true) {
      console.log('store metamask in root store');
      this.browserProvider = window.web3.currentProvider;
    }
    
    if (this.commonStore.getIsUser() && !this.userStore.isOnFixedAccount) {
      console.log('init metamask from root store');
      this.userStore.initMetamaskNetwork();
      
      return;
    }
    if (this.commonStore.getIsUser() && this.userStore.isOnFixedAccount) {
      this.commonStore.initCommonNetwork();
      window.web3.eth.accounts.wallet.add(userPrivKey);
      console.log('init user fixed network from root store');
      return;
    }
    if (!this.commonStore.getIsUser()) {
      this.commonStore.initCommonNetwork();
      window.web3.eth.accounts.wallet.add(verifierPrivKey);
      console.log('init verifier fixed network from root store');
    }
    
  }
}

const SingletonRootStore = new RootStore();

// detect
// const detectMetaMaskNetwork = autorun(() => {
//   let metaMaskInstalled = false;
//   let metaMaskLoggedIn = false;
//   let isOnTestNet = false;
//   let hasTestEther = false;
//   if (SingletonRootStore.commonStore.getIsUser()) {
//     SingletonRootStore.userStore.initMetamaskNetwork();
//     metaMaskInstalled = SingletonRootStore.userStore.isMetaMaskEnabled;
//     metaMaskLoggedIn = SingletonRootStore.userStore.isMetaMaskLoggedIn;
//     isOnTestNet = SingletonRootStore.userStore.currentNetwork === 'Ropsten' || SingletonRootStore.userStore.currentNetwork === 'Rinkeby' || SingletonRootStore.userStore.currentNetwork === 'Kovan';
//   }
//   if (metaMaskInstalled) SingletonRootStore.commonStore.completeSetupWalletProgress(0);
//   if (metaMaskLoggedIn) SingletonRootStore.commonStore.completeSetupWalletProgress(1);
//   if (isOnTestNet) SingletonRootStore.commonStore.completeSetupWalletProgress(2);
// });
export default SingletonRootStore;
