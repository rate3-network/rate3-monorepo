import {
  configure,
  observable,
  action,
} from 'mobx';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class ModalStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable infoModalIsShowing = false;
  @observable infoModalText = '';
  constructor(rootStore) {
    this.rootStore = rootStore;
  }
  @action
  openInfoModal(text) {
    this.infoModalText = text;
    this.infoModalIsShowing = true;
  }
  @action
  closeInfoModal() {
    this.infoModalText = '';
    this.rootStore.userStore.resetClaimLists();
    this.rootStore.userStore.getValidClaims();
    this.rootStore.userStore.initDb();
    this.rootStore.userStore.populateClaimLists();
    this.infoModalIsShowing = false;
  }
}
export default ModalStore;
