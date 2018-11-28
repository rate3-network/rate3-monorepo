/* Root store that contains all domain stores */
import {
  computed,
  observable,
  action,
  runInAction,
} from 'mobx';
import Web3 from 'web3';

import CommonStore from './CommonStore';
import UserStore from './UserStore';
import VerifierStore from './VerifierStore';
import PaymentStore from './PaymentStore';
import PanelButtonsStore from './PanelButtonsStore';
import ModalStore from './ModalStore';
import { fixedUserPrivKey, fixedVerifierPrivKey } from '../constants/defaults';

class RootStore {
  constructor() {
  }
  @observable commonStore = new CommonStore(this);
  @observable userStore = new UserStore(this);
  @observable verifierStore = new VerifierStore(this);
  @observable paymentStore = new PaymentStore(this);
  @observable panelButtonsStore = new PanelButtonsStore(this);
  @observable modalStore = new ModalStore(this);
  @observable browserProvider = null;

  @observable globalSpinnerIsShowing: Boolean = false;

  @observable startInitNetwork: Boolean = false;
  @observable finishInitNetwork: Boolean = false;

  @observable startInitMetamaskNetwork: Boolean = false;
  @observable finishInitMetamaskNetwork: Boolean = false;
  @observable startInitFixedNetwork: Boolean = false;

  @observable reonboardModalIsShowing: Boolean = false;

  @observable errorModalIsShowing = false;
  @observable error = 'We have encountered an unknown error.';

  @computed get errorMessage() {
    return `${this.error} Please refresh your page to restart the identity demonstration.`;
  }
  @computed get computedUserAddr() {
    if (this.commonStore.getIsUser()) {
      if (this.userStore.isOnFixedAccount) return this.userStore.fixedUserAddr;
      return this.commonStore.metamaskAccount;
    }
    return '0xd102503E987a6402A1E0b220369ea4A4Bce911E8'; // verifier address
  }
  @action
  displayErrorModal(msg) {
    this.errorModalIsShowing = true;
    this.error = msg;
  }
  @computed get currentNetwork() {
    if (this.commonStore.getIsUser()) {
      if (!this.userStore.isOnFixedAccount) return this.commonStore.metamaskCurrentNetwork;
      return this.commonStore.commonNetwork;
    }
    return this.commonStore.commonNetwork;
  }
  @action
  setStartInitNetworkTrue() {
    this.startInitNetwork = true;
  }


  @action
  async initNetwork() {
    if (!this.commonStore.getIsUser()) {
      this.commonStore.initCommonNetwork();
      window.web3.eth.accounts.wallet.add(fixedVerifierPrivKey); // verifier
    } else {
      // for user using own account, must detect metamask first
      if (!this.userStore.isOnFixedAccount) {
        // Modern Metamask Version without Web3 injection, but has ethereum provider
        let web3;
        if (window.ethereum) {
          web3 = new Web3(window.ethereum);
          window.web3 = web3;
          try {
            // Request account access if needed
            await window.ethereum.enable();
          } catch (error) {
            // User denied account access
            console.error(error);
          }
        // Legacy Metamask Version with Web3 injected
        } else if (typeof window.web3 !== 'undefined' && this.commonStore.web3HasMetamaskProvider()) {
          this.browserProvider = window.web3.givenProvider;
          window.web3 = new Web3(this.browserProvider);
        } else {
          return;
        }

      }

      if (!this.userStore.isOnFixedAccount) {
        runInAction(() => {
          this.startInitMetamaskNetwork = true;
        });
        // this.userStore.initMetamaskNetwork();
        // this.userStore.listenToMetaMaskAccountChange();
        this.commonStore.checkMetamaskNetwork();
        return;
      }
      if (this.userStore.isOnFixedAccount) {
        this.commonStore.initCommonNetwork();
        window.web3.eth.accounts.wallet.add(fixedUserPrivKey); // user
        return;
      }
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
