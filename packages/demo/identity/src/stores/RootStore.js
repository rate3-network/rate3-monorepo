/* Root store that contains all domain stores */
import {
  configure,
  observable,
  action,
} from 'mobx';

import CommonStore from './CommonStore';

class RootStore {
  @observable commonStore = new CommonStore(this);
}

const SingletonRootStore = new RootStore();

export default SingletonRootStore;
