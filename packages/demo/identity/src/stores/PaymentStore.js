import {
  configure,
  observable,
  computed,
  action,
  runInAction,
} from 'mobx';
import web3 from 'web3';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class PaymentStore {
  /* JSDOC: MARK START OBSERVABLE */
  gasLimit = 0.003;

  @observable paymentModalIsShowing = false;
  @observable gasPrice = 1;

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
    if (price.toString().length > 8) {
      return;
    }
    if (price > 6000000) {
      this.gasPrice = 5999999;
    } else {
      this.gasPrice = price;
    }
  }

  @action
  openPaymentModal(item) {
    this.paymentModalIsShowing = true;
    this.claimToAdd = item;
  }

  @action
  confirmAddClaim() {
    this.rootStore.userStore.addClaim(this.claimToAdd, this.gasPrice);
    this.closePaymentModal();
  }

  @action
  closePaymentModal() {
    this.paymentModalIsShowing = false;
  }
}

export default PaymentStore;
