/* Root store that contains all domain stores */
import {
  computed,
  observable,
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

export default SingletonRootStore;
