/* Root store that contains all domain stores */
import {
  computed,
  observable,
  autorun,
} from 'mobx';

import CommonStore from './CommonStore';
import UserStore from './UserStore';
import VerifierStore from './VerifierStore';

class RootStore {
  @observable commonStore = new CommonStore(this);
  @observable userStore = new UserStore(this);
  @observable verifierStore = new VerifierStore(this);

  @computed get currentNetwork() {
    if (this.commonStore.getIsUser()) {
      return this.userStore.currentNetwork;
    }
    return 'verifier network selection';
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
