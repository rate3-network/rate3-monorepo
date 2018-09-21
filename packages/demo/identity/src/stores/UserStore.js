import {
  configure,
  observable,
  action,
  computed,
  runInAction,
  autorun,
  when,
} from 'mobx';
import Web3 from 'web3';
import Identity from '../utils/Identity';
import { PENDING_REVIEW, PENDING_ADD, VERIFIED } from '../constants/general';
import identityRegistryJson from '../build/contracts/IdentityRegistry.json';
import identityJson from '../build/contracts/Identity.json';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions


class UserStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable userModalIsShowing = false;
  @observable userModalHasBeenViewed = false;
  @observable modalPage: Number = 0;
  @observable identityNames: Array = [];
  @observable identityAddresses: Array = [];//[{ id: 1, status: PENDING_REVIEW, value: '001 Changi Road' }];
  @observable identitySocialIds: Array = [];//[social1, social2, social3];

  @observable registerModalIsShowing = false;
  @observable registerSuccessModalIsShowing = false;
  // Modal Form
  @observable verifierList: Array = ['Pikachu', 'Eevee', 'Squirtle', 'Snorlax'];
  @observable verifierSelected: String = '_placeholder_';
  @observable formTextInputValue: String = '';
  @observable formType: String = '';
  // Wallet properties
  @observable currentNetwork: String = 'Detecting Network...';
  @observable isMetaMaskLoggedIn: Boolean = false;
  @observable isOnFixedAccount: Boolean = false; // if on fixed account, use network settings from commonstore

  @observable fixedUserAcctNetwork: String = 'Ropsten';

  @observable metamaskAccount: String = '';
  @observable metamaskBalance: String = '';

  @observable registryContractAddr = '0x2d0335d5f2405ab1f9d149913b05ad00b9dea041';
  @observable identityContractAddr = '';
  @observable userAddr = '';
  @observable doesIdentityExist = false;
  @observable registryContract = {};
  @observable identityContract = {};
  @observable identityAddress = '';

  @observable nameClaim = '';
  @observable addressClaim = '';
  @observable socialIdClaim = '';

  @observable identityTable = [];
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
    // autorun(() => {
    //   console.log(this.getFormTextInputValue(), this.getVerifierSelected());
    // });
  }

  @action
  setIdentityTable(table) {
    this.identityTable = table;
    table.forEach((row) => {
      if (row.type === 'name' && row.status !== VERIFIED) {
        const claim = new Identity(row.value, row.value, row.type, row.user, row.verifier, row.status);
        this.identityNames.push(claim);
      }
      if (row.type === 'address' && row.status !== VERIFIED) {
        const claim = new Identity(row.value, row.value, row.type, row.user, row.verifier, row.status);
        this.identityAddresses.push(claim);
      }
      if (row.type === 'socialId' && row.status !== VERIFIED) {
        const claim = new Identity(row.value, row.value, row.type, row.user, row.verifier, row.status);
        this.identitySocialIds.push(claim);
      }
    });
  }
  @action
  async getUserAddr() {
    const accounts = await window.web3.eth.getAccounts();
    try {
      if (accounts.length > 0) {
        runInAction(() => {
          this.userAddr = accounts[0];
          console.log('user addr', this.userAddr);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
  createIdentity() {
    this.registryContract.methods.createIdentity().send({from: this.userAddr, gas: 6000000}, (err, result) => {console.log(result);});
  }
  getPastEvents() {
    this.registryContract.getPastEvents('NewIdentity', { fromBlock: 0, toBlock: 'latest' }, (error, events) => { console.log(events); });
  }
  checkHasIdentity() {
    this.registryContract.methods.hasIdentity(this.userAddr).call().then(console.log);
  }
  @action
  async getIdentities() {
    const hasIdentity = await this.registryContract.methods.hasIdentity(this.userAddr).call();
    let idContractAddr = '';
    if (!hasIdentity) {
      const identityAddrCreated = await this.registryContract.methods.createIdentity().send({from: this.userAddr, gas: 6000000});
      idContractAddr = identityAddrCreated;
    }
    if (hasIdentity) {
      idContractAddr = await this.registryContract.methods.identities(this.userAddr).call();
    }
    console.log('id contract address');
      console.log(idContractAddr);
      const identityContract = new window.web3.eth.Contract(identityJson.abi, idContractAddr);
      window.identityContract = identityContract;
      runInAction(() => {
        this.identityContract = identityContract;
        this.identityContractAddr = identityContract._address;
      });
      
      // const claimAddedEvents = await identityContract.getPastEvents('ClaimAdded', { fromBlock: 0, toBlock: 'latest' });
      // console.log('claimAddedEvents', claimAddedEvents);
      // claimAddedEvents.forEach((event) => {
      //   const rawData = event.returnValues.data;
      //   console.log(window.web3.utils.hexToAscii(rawData));
      // });


      // name claim
      let nameClaims;
      let nameClaimId;
      try {
        nameClaims = await identityContract.methods.getClaimIdsByTopic(101).call();
        nameClaimId = nameClaims[0];
        console.log('nameClaimId', nameClaimId);
      } catch (err) {
        console.log(err);
      }
      
      try {
        const nameClaim = await identityContract.methods.getClaim(nameClaimId).call();
        runInAction(() => {
          console.log(nameClaim);
          this.nameClaim = window.web3.utils.hexToAscii(nameClaim.data);
          const nameClaimObj = new Identity(this.nameClaim, this.nameClaim, 'name', this.userAddr, this.signature, VERIFIED);
          // if (!this.identityNames.some((item) => {return item.id === nameClaimObj.id})) {
          this.identityNames.push(nameClaimObj);
          // }
          console.log('name claim: ', this.nameClaim);
        });
        
      } catch (err) {
        console.log(err);
      }

      // address claim
      let addressClaims;
      let addressClaimId;
      try {
        addressClaims = await identityContract.methods.getClaimIdsByTopic(102).call();
        addressClaimId = addressClaims[0];
        console.log('addressClaimId', addressClaimId);
      } catch (err) {
        console.log(err);
      }
      
      try {
        const addressClaim = await identityContract.methods.getClaim(addressClaimId).call();
        runInAction(() => {
          this.addressClaim = window.web3.utils.hexToAscii(addressClaim.data);
          const addressClaimObj = new Identity(this.addressClaim, this.addressClaim, 'address', this.userAddr, this.signature, VERIFIED);
          // if (!this.identityAddresses.some((item) => {return item.id === addressClaimObj.id})) {
          this.identityAddresses.push(addressClaimObj);
          // }
          console.log('address claim: ', this.addressClaim);
        });
      } catch (err) {
        console.log(err);
      }

      // social id claim
      let socialIdClaims;
      let socialIdClaimId;
      try {
        socialIdClaims = await identityContract.methods.getClaimIdsByTopic(103).call();
        socialIdClaimId = socialIdClaims[0];
        console.log('socialIdClaimId', socialIdClaimId);
      } catch (err) {
        console.log(err);
      }
      
      try {
        const socialIdClaim = await identityContract.methods.getClaim(socialIdClaimId).call();
        runInAction(() => {
          this.socialIdClaim = window.web3.utils.hexToAscii(socialIdClaim.data);
          const socialIdClaimObj = new Identity(this.socialIdClaim, this.socialIdClaim, 'socialId', this.userAddr, this.signature, VERIFIED);
          // if (!this.identitySocialIds.some((item) => {return item.id === socialIdClaimObj.id})) {
          this.identitySocialIds.push(socialIdClaimObj);
          // }
          console.log('social id claim: ', this.socialIdClaim);
        });
      } catch (err) {
        console.log(err);
      }
  }
  @action
  getIdentityContract() {
    this.registryContract.methods.identities(this.userAddr).call()
      .then((result) => {
        console.log(result);
        runInAction(() => {
          this.identityAddress = result;

          const identityContract = new window.web3.eth.Contract(identityJson.abi, this.identityAddress);
          window.identityContract = identityContract;
          this.identityContract = identityContract;
          this.identityContractAddr = identityContract._address;
        });
        
      });
  }
  @action
  addClaim(item) {
    console.log('item', item);
    const claim = item.value;
    const data = window.web3.utils.asciiToHex(claim);
    console.log('data', data);
    const addr = this.userAddr;
    const issuerAddr = this.identityContractAddr;
    let topic;
    // if (item.sss)
    if (item.type === 'name') topic = 101;
    if (item.type === 'address') topic = 102;
    if (item.type === 'socialId') topic = 103;

    const dataToSign = window.web3.utils.soliditySha3(issuerAddr, topic, data);
    console.log('dataToSign', dataToSign);
    const location = "some location";
    let sig;
    console.log('line 197', this.userAddr);
    window.web3.eth.personal.sign(dataToSign, this.userAddr, '').then((str) => {
      sig = str;
      console.log('signature is');
      console.log(str);
      window.identityContract.methods.addClaim(topic, 1, issuerAddr, sig, data, location)
        .send({ from: this.userAddr, gas: 6000000 },
          (err, result) => {
            console.log('from addClaim callback');
            if (err) console.log(err);
            if (result) console.log(result);
          }
        );
    });
 
    console.log(sig);

    const table = this.identityTable;
    const itemFound = table.find((el) => {
      return (el.user === item.user && el.value === item.value && el.type === item.type);
    });
    const indexFound = table.findIndex((el) => {
      return (el.user === item.user && el.value === item.value && el.type === item.type);
    });
    
    itemFound.status = VERIFIED;

    table[indexFound] = itemFound;
    localStorage.setItem('table', JSON.stringify(table));
    
  }
  web3HasMetamaskProvider() {
    return (
      (window.web3.givenProvider !== null && typeof window.web3.givenProvider !== 'undefined' &&
        window.web3.givenProvider.isMetaMask === true) ||
      (window.web3.currentProvider !== null && typeof window.web3.currentProvider !== 'undefined' &&
        window.web3.currentProvider.isMetaMask === true));
  }
  isMetaMaskEnabled() {
    console.log('isMetaMaskEnabled from userstore ');
    return (typeof window.web3 !== 'undefined' && this.web3HasMetamaskProvider());
  }

  @action
  changeFixedUserAcctNetwork(v) {
    this.fixedUserAcctNetwork = v;
  }

  @action
  async initMetamaskNetwork() {
    this.rootStore.finishInitNetwork = false;
    console.log('init metamask network');
    this.rootStore.commonStore.resetSetupWalletProgress();
    if (this.isOnFixedAccount) {
      this.currentNetwork = 'user is on a fixed network';
      console.log('quit init metamask coz on fixed account');
      return;
    }
    if (!this.isMetaMaskEnabled()) {
      this.currentNetwork = 'Please enable MetaMask browser extension';
      return;
    }

    this.rootStore.commonStore.completeSetupWalletProgress(0);

    let web3;
    if (window.web3.currentProvider !== null && window.web3.currentProvider.isMetaMask === true) {
      console.log('from user store: is meta mask');
      web3 = new Web3(window.web3.currentProvider);
    } else {
      web3 = new Web3(this.rootStore.browserProvider);
    }
    window.web3 = web3;
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) console.log('User is not logged in to MetaMask');
      if (accounts.length > 0) {
        runInAction(() => {
          this.isMetaMaskLoggedIn = true;
          [this.metamaskAccount] = accounts;
          this.rootStore.commonStore.completeSetupWalletProgress(1);
        });
      }
    } catch (err) {
      console.error('An error occurred while detecting MetaMask login status');
    }
    try {
      const networkType = await web3.eth.net.getNetworkType();
      runInAction(() => {
        switch (networkType) {
          case 'ropsten':
            this.currentNetwork = 'Ropsten';
            this.rootStore.commonStore.completeSetupWalletProgress(2);
            break;
          case 'rinkeby':
            this.currentNetwork = 'Rinkeby';
            this.rootStore.commonStore.completeSetupWalletProgress(2);
            break;
          case 'kovan':
            this.currentNetwork = 'Kovan';
            this.rootStore.commonStore.completeSetupWalletProgress(2);
            break;
          case 'private':
          this.currentNetwork = 'Private';
          this.rootStore.commonStore.completeSetupWalletProgress(2);
          break;
          default:
            this.currentNetwork = 'Other Net or';
        }
      });
    } catch (err) {
      console.error('An error occurred while detecting MetaMask network type');
    }

    try {
      const account = this.metamaskAccount;
      const balance = await web3.eth.getBalance(account);
      runInAction(() => {
        this.metamaskBalance = balance;
        console.log(balance);
        this.rootStore.commonStore.completeSetupWalletProgress(3);
        this.rootStore.globalSpinnerIsShowing = false;
        this.rootStore.finishInitNetwork = true;
        
      });
    } catch (err) {
      console.error('An error occurred while checking balance');
    }
  }

  getFormTextInputValue() {
    return this.formTextInputValue;
  }
  getVerifierSelected() {
    return this.verifierSelected;
  }
  getVerifierList() {
    return this.verifierList;
  }

  getModalPage() {
    return this.modalPage;
  }

  getIdentityNames() {
    return this.identityNames;
  }
  getIdentityAddresses() {
    return this.identityAddresses;
  }
  getIdentitySocialIds() {
    return this.identitySocialIds;
  }

  getUserModalIsShowing() {
    return this.userModalIsShowing;
  }

  getRegisterModalIsShowing() {
    return this.registerModalIsShowing;
  }
  getRegisterSuccessModalIsShowing() {
    return this.registerSuccessModalIsShowing;
  }

  @action
  openModal() {
    this.userModalIsShowing = true;
  }

  @action
  closeModal() {
    this.userModalIsShowing = false;
    console.log(this.userModalIsShowing);
  }

  @action
  handleModalIndexChange(step) {
    this.modalPage = step;
  }

  @action
  handleModalNext() {
    this.modalPage += 1;
  }
  @action
  handleModalBack() {
    this.modalPage -= 1;
  }
  @action
  openRegisterModal(name) {
    this.registerModalIsShowing = true;
    this.formType = name;
  }
  @action
  closeRegisterModal() {
    this.registerModalIsShowing = false;
  }
  @action
  openRegisterSuccessModal() {
    this.registerSuccessModalIsShowing = true;
  }
  @action
  closeRegisterSuccessModal() {
    this.registerSuccessModalIsShowing = false;
  }
  @action
  setVerifierSelected(v) {
    this.verifierSelected = v;
  }
  @action
  setFormTextInputValue(v) {
    this.formTextInputValue = v;
  }
  @action
  setFormType(type) {
    this.formType = type;
  }
}
export default UserStore;
