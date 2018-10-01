import {
  configure,
  observable,
  action,
  runInAction,
} from 'mobx';
import Web3 from 'web3';

import Identity from '../utils/Identity';
import MyTable from '../utils/MyTable';
import { PENDING_REVIEW, PENDING_ADD, VERIFIED } from '../constants/general';
import identityRegistryJson from '../build/contracts/IdentityRegistry.json';
import identityJson from '../build/contracts/Identity.json';
import { fixedUserAddress, fixedUserRegistryContractAddress, fixedVerifierIdentityContractAddress } from '../constants/defaults';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

class UserStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable userModalIsShowing = false;
  @observable userModalHasBeenViewed = false;
  @observable modalPage: Number = 0;

  @observable registerModalIsShowing = false;
  @observable registerSuccessModalIsShowing = false;
  // Modal Form
  @observable verifierList: Array = ['Vitalik'];
  @observable verifierSelected: String = '_placeholder_';
  @observable formTextInputValue: String = '';
  @observable formType: String = '';
  // Wallet properties
  @observable currentNetwork: String = 'Detecting Network...';
  @observable isMetaMaskLoggedIn: Boolean = false;
  // if on fixed account, use network settings from commonstore
  @observable isOnFixedAccount: Boolean = true;

  @observable fixedUserAcctNetwork: String = 'Ropsten';

  @observable metamaskAccount: String = '';
  @observable metamaskBalance: String = '';

  @observable registryContractAddr = fixedUserRegistryContractAddress;
  verifierIdentityContractAddr = fixedVerifierIdentityContractAddress;
  @observable identityContractAddr = '';
  @observable userAddr = '';
  @observable fixedUserAddr = fixedUserAddress;
  @observable doesIdentityExist = false;
  @observable registryContract = {};
  @observable identityContract = {};
  @observable identityAddress = '';

  @observable nameClaim = '';
  @observable addressClaim = '';
  @observable socialIdClaim = '';

  @observable db = null;
  @observable nameClaimList = [];
  @observable addressClaimList = [];
  @observable socialIdClaimList = [];

  @observable accountUsedForDetectingChange = null;

  @observable startedDeployingIdentity = false;
  @observable finishedDeployingIdentity = false;

  @observable startedLoadingClaims = false;
  @observable finishedLoadingClaims = false;

  @observable signature = '';
  @observable startedAddingClaim = false;
  @observable finishedAddingClaim = false;

  @observable reOnboardModalIsShowing = false;
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;

    const myDb = new MyTable('rate3', 'identity-demo');
    if (myDb.hasTable('identity-demo')) {
      myDb.getTable('identity-demo');
    } else {
      myDb.createTable();
    }
    runInAction(() => {
      this.db = myDb;
      console.log(this.db.getTable('identity-demo'));
    });
  }
  @action
  initDb() {
    const myDb = new MyTable('rate3', 'identity-demo');
    if (myDb.hasTable('identity-demo')) {
      myDb.getTable('identity-demo');
    } else {
      myDb.createTable();
    }
    runInAction(() => {
      this.db = myDb;
      console.log(this.db.getTable('identity-demo'));
    });
  }
  @action
  resetClaimLists() {
    this.nameClaimList = [];
    this.addressClaimList = [];
    this.socialIdClaimList = [];
  }
  @action
  populateClaimLists() {
    let userAddress = '';
    if (this.isOnFixedAccount) {
      userAddress = this.fixedUserAddr;
    } else {
      userAddress = this.userAddr;
    }
    this.db.getAllNameClaims().forEach((claim) => {
      if (claim.user === userAddress) this.nameClaimList.push(claim);
    });
    this.db.getAllAddressClaims().forEach((claim) => {
      if (claim.user === userAddress) this.addressClaimList.push(claim);
    });
    this.db.getAllSocialIdClaims().forEach((claim) => {
      if (claim.user === userAddress) this.socialIdClaimList.push(claim);
    });
  }
  @action
  resetPublishClaim() {
    this.startedAddingClaim = false;
    this.finishedAddingClaim = false;
  }
  @action
  changeToMetaMaskAccount() {
    this.isOnFixedAccount = false;
    window.localStorage.setItem('accountType', 'metamask');
    if (!this.rootStore.commonStore.isWalletSetupDone) this.rootStore.openReonboardModal();
    console.log('changing to metamask account in user store');
  }
  @action
  changeToFixedAccount() {
    this.isOnFixedAccount = true;
    window.localStorage.setItem('accountType', 'fixed');
  }

  @action
  async getUserAddr() {
    const accounts = await window.web3.eth.getAccounts();
    try {
      if (accounts.length > 0) {
        runInAction(() => {
          [this.userAddr] = accounts;
          console.log('user addr', this.userAddr);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
  createIdentity() {
    this.registryContract.methods.createIdentity().send(
      { from: this.userAddr, gas: 4000000 },
      (err, result) => {
        console.log(result);
      },
    );
  }
  getPastEvents() {
    
  }
  checkHasIdentity() {
    this.registryContract.methods.hasIdentity(this.userAddr).call().then(console.log);
  }

  listenToNewIdentityEvent() {
    const checkNewIdentity = () => {
      console.log('polling');
      this.registryContract.getPastEvents('NewIdentity', { fromBlock: 0, toBlock: 'latest' }, (error, events) => {
        if (error) {
          console.error(error);
        }
        if (events) {
          events.forEach((ev) => {
            if (ev.returnValues.senderAddress === this.userAddr) {
              console.log('cleared interval');
              runInAction(()=>{this.finishedDeployingIdentity = true;});
              clearInterval(polling);
            }
          });
        }
      });
    };
    let polling = setInterval(checkNewIdentity, 1000);
    // this.registryContract.getPastEvents('NewIdentity', { fromBlock: 0, toBlock: 'latest' }, (error, events) => { console.log(events); });
  }

  listenToNewClaimEvent() {
    const checkNewClaim = () => {
      console.log('polling for new claim');
      this.identityContract.getPastEvents('ClaimAdded', { fromBlock: 0, toBlock: 'latest' }, (error, events) => {
        if (error) {
          console.error(error);
        }
        if (events) {
          events.forEach((ev) => {
            if (ev.returnValues.signature === this.signature) {
              console.log('cleared interval for polling new claim');
              runInAction(() =>{ this.finishedAddingClaim = true; });
              this.resetClaimLists();
              this.getIdentities();
              this.initDb();
              this.populateClaimLists();
              clearInterval(polling);
              // window.location.reload();
              
            }
          });
        }
      });
    };
    let polling = setInterval(checkNewClaim, 1000);
    // this.registryContract.getPastEvents('NewIdentity', { fromBlock: 0, toBlock: 'latest' }, (error, events) => { console.log(events); });
  }

  @action
  async getIdentities() {
    console.log('this.registryContract', window.registryContract);
    runInAction(() => { this.startedLoadingClaims = true; });
    let userAddress = '';
    if (this.isOnFixedAccount) {
      userAddress = this.fixedUserAddr;
    } else {
      userAddress = this.userAddr;
    }
    const hasIdentity = await this.registryContract.methods.hasIdentity(userAddress).call();
    let idContractAddr = '';
    if (!hasIdentity) {
      runInAction(()=>{this.startedDeployingIdentity = true;});
      this.listenToNewIdentityEvent();
      const identityAddrCreated = await this.registryContract.methods.createIdentity().send({ from: userAddress, gas: 6000000 });
      idContractAddr = identityAddrCreated;
      
    }
    if (hasIdentity) {
      idContractAddr = await this.registryContract.methods.identities(userAddress).call();
      const identityContract = new window.web3.eth.Contract(identityJson.abi, idContractAddr);
      window.identityContract = identityContract;
      runInAction(() => {
        this.identityContract = identityContract;
        this.identityContractAddr = identityContract._address;
      });

      const getPastEventCallBack = (err, events) => {
        if (err) {
          console.error(err);
        }
        if (events) {
          console.log(events);
          const addedEvents = events.filter((item) => { return item.event === 'ClaimAdded'; });
          const removedEvents = events.filter((item) => { return item.event === 'ClaimRemoved'; });
          console.log('addedEvents', addedEvents);
          console.log('removedEvents', removedEvents);
          const tempNameList = [];
          const tempAddressList = [];
          const tempSocialIdList = [];
          let newNameClaim, newAddressClaim, newSocialIdClaim;
          addedEvents.forEach((ev) => {
            let currNameLogIndex = -1;
            let currAddressLogIndex = -1;
            let currSocialIdLogIndex = -1;
            
            console.log('ev', ev);
            const returnValues = ev.returnValues;
  
            const data = window.web3.utils.hexToAscii(returnValues.data);
            let type;
            // if (item.sss)
            if (returnValues.topic === '101') type = 'name'; currNameLogIndex = ev.logIndex;
            if (returnValues.topic === '102') type = 'address'; currAddressLogIndex = ev.logIndex;
            if (returnValues.topic === '103') type = 'socialId'; currSocialIdLogIndex = ev.logIndex;
            const newClaim = new Identity(data, type, userAddress, 'Vitalik Buterin', returnValues.signature, ev.transactionHash, returnValues.claimId, VERIFIED);
            if (returnValues.topic === '101') tempNameList.push({ claim: newClaim, index: currNameLogIndex });
            if (returnValues.topic === '102') tempAddressList.push({ claim: newClaim, index: currAddressLogIndex });
            if (returnValues.topic === '103') tempSocialIdList.push({ claim: newClaim, index: currSocialIdLogIndex });

            newNameClaim = tempNameList.reduce((prev, next) => {
              if (prev === null) return next;
              if (next.index > prev.index) {
                return next;
              }
              return prev;
            }, null);
            
            newAddressClaim = tempAddressList.reduce((prev, next) => {
              if (prev === null) return next;
              if (next.index > prev.index) {
                return next;
              }
              return prev;
            }, null);
            console.log('Rate: getPastEventCallBack -> newAddressClaim', newAddressClaim);
            newSocialIdClaim = tempSocialIdList.reduce((prev, next) => {
              if (prev === null) return next;
              if (next.index > prev.index) {
                return next;
              }
              return prev;
            }, null);
            // console.log(newClaim);
          });
          runInAction(() => {
            if (newNameClaim !== null && newNameClaim !== undefined && newNameClaim.claim !== undefined) this.nameClaimList.push(newNameClaim.claim);
            if (newAddressClaim !== null && newAddressClaim !== undefined && newAddressClaim.claim !== undefined) this.addressClaimList.push(newAddressClaim.claim);
            if (newSocialIdClaim !== null && newSocialIdClaim !== undefined && newSocialIdClaim.claim !== undefined) this.socialIdClaimList.push(newSocialIdClaim.claim);
          });
          removedEvents.forEach((ev) => {
            const returnValues = ev.returnValues;
            
            if (returnValues.topic === '101') {
              const foundIndex = this.nameClaimList.findIndex((claim) => {
                return claim.txHash === ev.transactionHash;
              });
              if (foundIndex !== -1) runInAction(() => { this.nameClaimList.splice(foundIndex, 1); });
            }
            if (returnValues.topic === '102') {
              const foundIndex = this.addressClaimList.findIndex((claim) => {
                return claim.txHash === ev.transactionHash;
              });
              if (foundIndex !== -1) runInAction(() => { this.addressClaimList.splice(foundIndex, 1); });
            }
            if (returnValues.topic === '103') {
              const foundIndex = this.socialIdClaimList.findIndex((claim) => {
                return claim.txHash === ev.transactionHash;
              });
              if (foundIndex !== -1) runInAction(() => { this.socialIdClaimList.splice(foundIndex, 1); });
            }
          });
          runInAction(() => { this.finishedLoadingClaims = true; });
        }
      };
      this.identityContract.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' }, getPastEventCallBack);
    }
  }

  @action
  getIdentityContract() {
    let userAddress = '';
    if (this.isOnFixedAccount) {
      userAddress = this.fixedUserAddr;
    } else {
      userAddress = this.userAddr;
    }
    this.registryContract.methods.identities(userAddress).call()
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
    let userAddress = '';
    if (this.isOnFixedAccount) {
      userAddress = this.fixedUserAddr;
    } else {
      userAddress = this.userAddr;
    }
    console.log('item', item);
    const claim = item.value;
    const data = window.web3.utils.asciiToHex(claim);
    console.log('data', data);
    const addr = userAddress;
    // const issuerAddr = this.verifierIdentityContractAddr;
    let topic;
    // if (item.sss)
    if (item.type === 'name') topic = 101;
    if (item.type === 'address') topic = 102;
    if (item.type === 'socialId') topic = 103;


    // const dataToSign = window.web3.utils.soliditySha3(this.verifierIdentityContractAddr, topic, data);
    const location = 'some location';
    let sig = item.signature;
    this.signature = sig;
    console.log('signature from db: ', this.signature);
    this.startedAddingClaim = true;
    this.listenToNewClaimEvent();
    if (!this.isOnFixedAccount) {
      console.log('adding from metamask account');
      console.log('Rate: addClaim -> data', data);
      console.log('Rate: addClaim -> this.signature', this.signature);
      console.log('Rate: addClaim -> this.verifierIdentityContractAddr', this.verifierIdentityContractAddr);
      console.log('Rate: addClaim -> topic', topic);
      window.identityContract.methods.addClaim(topic, 1, this.verifierIdentityContractAddr, this.signature, data, location)
        .send({ from: userAddress, gas: 6000000 },
          (err, result) => {
            console.log('from addClaim callback');
            if (err) console.log(err);
            if (result) {
              console.log(result);
              this.db.deleteClaim(addr, claim);
            }
          }
        );
    } else {
      console.log('sig', sig);
      window.identityContract.methods.addClaim(topic, 1, this.verifierIdentityContractAddr, sig, data, location)
        .send(
          { from: userAddress, gas: 6000000 },
          (err, result) => {
            console.log('from addClaim callback');
            if (err) console.log(err);
            if (result) {
              console.log(result);
              this.db.deleteClaim(addr, claim);
            }
          },
        );
    }

    console.log(sig);
  }

  @action
  listenToMetaMaskAccountChange() {
    console.log('listener mounted');
    if (!window.web3.eth.givenProvider) return;
    window.web3.eth.givenProvider.publicConfigStore.on('update', (change) => {
      if (this.accountUsedForDetectingChange === null) {
        runInAction(() => {
          this.accountUsedForDetectingChange = change.selectedAddress;
        });
      } else if (this.accountUsedForDetectingChange !== change.selectedAddress) {
        window.location.reload();
      }
    });
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
  @action
  openReOnboardModal() {
    this.reOnboardModalIsShowing = true;
  }
}
export default UserStore;
