import {
  configure,
  observable,
  computed,
  action,
  runInAction,
} from 'mobx';
import web3 from 'web3';
import { dbPrefix } from '../constants/defaults';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class PaymentStore {
  /* JSDOC: MARK START OBSERVABLE */

  @observable paymentModalIsShowing = false;
  @observable gasPrice = 5;

  @observable claimToAdd = {};
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed get maxFee() {
    if (typeof this.gasPrice === 'string') {
      if (this.gasPrice === '') {
        return 0;
      }
      const feeInWei = web3.utils.toWei(this.gasPrice, 'gwei');
      return web3.utils.fromWei(feeInWei);
    }
    if (typeof this.gasPrice === 'number') {
      const feeInWei = web3.utils.toWei(this.gasPrice.toString(), 'gwei');
      return web3.utils.fromWei(feeInWei);
    }
    return 0;
  }
  @action
  setGasPrice(price) {
    if (price > 1000) {
      this.gasPrice = 1000;
    } else {
      this.gasPrice = price;
    }
  }

  @computed get gasPriceInWei() {
    let result = 0;
    if (typeof this.gasPrice === 'string') {
      if (this.gasPrice === '') {
        result = 0;
      }
      result = web3.utils.toWei(this.gasPrice, 'gwei');
    }
    if (typeof this.gasPrice === 'number') {
      result = web3.utils.toWei(this.gasPrice.toString(), 'gwei');
    }
    return result;
  }

  @action
  openPaymentModal(item) {
    this.paymentModalIsShowing = true;
    this.claimToAdd = item;
  }

  @action
  confirmAddClaim() {
    if (this.claimToAdd.type === 'name') this.rootStore.panelButtonsStore.confirmPublishName();
    if (this.claimToAdd.type === 'address') this.rootStore.panelButtonsStore.confirmPublishAddress();
    if (this.claimToAdd.type === 'socialId') this.rootStore.panelButtonsStore.confirmPublishSocialId();
    this.rootStore.userStore.addClaim(this.claimToAdd, this.gasPrice);
    this.closePaymentModal();
  }

  @action
  closePaymentModal() {
    this.paymentModalIsShowing = false;
  }
}

export default PaymentStore;
