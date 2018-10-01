/* Root store that contains all domain stores */
import {
  computed,
  observable,
  action,
} from 'mobx';

import CommonStore from './CommonStore';
import UserStore from './UserStore';
import VerifierStore from './VerifierStore';
import { fixedUserPrivKey, fixedVerifierPrivKey } from '../constants/defaults';

class RootStore {
  constructor() {
  }
  @observable commonStore = new CommonStore(this);
  @observable userStore = new UserStore(this);
  @observable verifierStore = new VerifierStore(this);

  @observable browserProvider = null;

  @observable globalSpinnerIsShowing: Boolean = false;

  @observable startInitNetwork: Boolean = false;
  @observable finishInitNetwork: Boolean = false;

  @observable startInitMetamaskNetwork: Boolean = false;
  @observable finishInitMetamaskNetwork: Boolean = false;
  @observable startInitFixedNetwork: Boolean = false;

  @observable reonboardModalIsShowing: Boolean = false;
  @computed get currentNetwork() {
    if (this.commonStore.getIsUser()) {
      if (!this.userStore.isOnFixedAccount) return this.commonStore.metamaskCurrentNetwork;
      return this.commonStore.commonNetwork;
    }
    return this.commonStore.commonNetwork;
  }


  @action
  initNetwork() {
    // for user using own account, must detect metamask first
    console.log('init root network');
    if (this.commonStore.getIsUser() && !this.userStore.isOnFixedAccount) {
      if (typeof window.web3 === 'undefined') {
        console.error('no web3 is installed or metamask not enabled');
        return;
      }
    }
    if (typeof window.web3 !== 'undefined' && this.commonStore.web3HasMetamaskProvider() && window.web3.currentProvider.isMetaMask) {
      console.log('store metamask in root store');
      this.browserProvider = window.web3.currentProvider;
    }
    
    if (this.commonStore.getIsUser() && !this.userStore.isOnFixedAccount) {
      console.log('init metamask from root store');
      this.startInitMetamaskNetwork = true;
      // this.userStore.initMetamaskNetwork();
      // this.userStore.listenToMetaMaskAccountChange();
      this.commonStore.checkMetamaskNetwork();
      return;
    }
    if (this.commonStore.getIsUser() && this.userStore.isOnFixedAccount) {
      this.commonStore.initCommonNetwork();
      window.web3.eth.accounts.wallet.add(fixedUserPrivKey); // user
      console.log('init user fixed network from root store');
      return;
    }
    if (!this.commonStore.getIsUser()) {
      this.commonStore.initCommonNetwork();
      window.web3.eth.accounts.wallet.add(fixedVerifierPrivKey); // verifier
      console.log('init verifier fixed network from root store');
    }
  }
  @action
  openReonboardModal() {
    this.reonboardModalIsShowing = true;
  }
  @action
  closeReonboardModal() {
    this.reonboardModalIsShowing = false;
  }
}

const SingletonRootStore = new RootStore();

export default SingletonRootStore;
