/* Root store that contains all domain stores */
import {
  configure,
  observable,
  action,
} from 'mobx';

import CommonStore from './CommonStore';
import UserStore from './UserStore';

class RootStore {
  @observable commonStore = new CommonStore(this);
  @observable userStore = new UserStore(this);
}

const SingletonRootStore = new RootStore();

export default SingletonRootStore;
