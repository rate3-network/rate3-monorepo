import {
  configure,
  observable,
  computed,
  action,
  runInAction,
} from 'mobx';

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

  @action
  setGasPrice(price) {
    this.gasPrice = price;
  }

  @action
  openPaymentModal(item) {
    this.paymentModalIsShowing = true;
    this.claimToAdd = item;
  }

  @action
  confirmAddClaim() {
    this.rootStore.userStore.addClaim(this.claimToAdd);
  }

  @action
  closePaymentModal() {
    this.paymentModalIsShowing = false;
  }
}

export default PaymentStore;
