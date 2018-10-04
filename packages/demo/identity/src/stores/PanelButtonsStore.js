import {
  configure,
  observable,
  computed,
  action,
  runInAction,
} from 'mobx';
import web3 from 'web3';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class PanelButtonsStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable userPublishNameButtonConfirmed = false;
  @observable userPublishAddressButtonConfirmed = false;
  @observable userPublishSocialIdButtonConfirmed = false;
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  confirmPublishName() {
    console.log('Rate: PanelButtonsStore -> confirmPublishSocialId -> confirmPublishName');
    this.userPublishNameButtonConfirmed = true;
  }
  @action
  confirmPublishAddress() {
    console.log('Rate: PanelButtonsStore -> confirmPublishSocialId -> confirmPublishAddress');
    this.userPublishAddressButtonConfirmed = true;
  }
  @action
  confirmPublishSocialId() {
    console.log('Rate: PanelButtonsStore -> confirmPublishSocialId -> confirmPublishSocialId');
    this.userPublishSocialIdButtonConfirmed = true;
  }

}

export default PanelButtonsStore;
