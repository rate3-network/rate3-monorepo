
import { PENDING_REVIEW, PENDING_ADD, VERIFIED, PUBLISHING, REMOVING } from '../constants/general';

class LocalList {
  constructor(prefix, name) {
    this.listName = `${prefix}.${name}`;
    this.store = window.sessionStorage;
    this.list = [];
    if (this.retrieveList() !== null) {
      this.list = this.retrieveList();
    }
  }

  /* Private */
  setList(value) {
    this.store.setItem(this.listName, JSON.stringify(value));
  }
  /* Private */
  retrieveList() {
    return JSON.parse(this.store.getItem(this.listName));
  }

  getList() {
    return this.list;
  }
  save() {
    this.setList(this.list);
  }

  containsItem(hash, network) {
    if (this.list.length > 0) {
      return this.list.some((item) => { return item.hash === hash && item.network === network; });
    }
    return false;
  }
  findIndex(hash, network) {
    if (this.list.length > 0) {
      return this.list.findIndex((item) => { return item.hash === hash && item.network === network; });
    }
    return -1;
  }
  findIndexByClaim(claim) {
    if (this.list.length > 0) {
      return this.list.findIndex((item) => { return JSON.stringify(item.claim) === JSON.stringify(claim); });
    }
    return -1;
  }
  push(hash, network, claim) {
    if (this.containsItem(hash, network)) return;
    const newObj = { hash, network, claim };
    this.list.push(newObj);
    this.save();
  }
  delete(hash, network) {
    if (!this.containsItem(hash, network)) return;
    const index = this.findIndex(hash, network);
    if (index === -1) return;
    this.list.splice(index, 1);
    this.save();
  }
  deleteByIndex(id) {
    this.list.splice(id, 1);
    this.save();
  }

  getNameClaimRemovals() {
    const temp = this.list.filter((item) => {
      return item.claim.status === VERIFIED && item.claim.type === 'name';
    });
    return temp;
  }
  getAddressClaimRemovals() {
    const temp = this.list.filter((item) => {
      return item.claim.status === VERIFIED && item.claim.type === 'address';
    });
    return temp;
  }
  getSocialIdClaimRemovals() {
    const temp = this.list.filter((item) => {
      return item.claim.status === VERIFIED && item.claim.type === 'socialId';
    });
    return temp;
  }

  getNameClaimPublish() {
    const temp = this.list.filter((item) => {
      return item.claim.status === PENDING_ADD && item.claim.type === 'name';
    });
    return temp;
  }
  getAddressClaimPublish() {
    const temp = this.list.filter((item) => {
      return item.claim.status === PENDING_ADD && item.claim.type === 'address';
    });
    return temp;
  }
  getSocialIdClaimPublish() {
    const temp = this.list.filter((item) => {
      return item.claim.status === PENDING_ADD && item.claim.type === 'socialId';
    });
    return temp;
  }
}

export default LocalList;

// const myList = new LocalList('haha', '1');
// myList.getList();
// myList.push('123');
// myList.getList();
// myList.push('aasdf');
// myList.getList();
// myList.delete('123');
// myList.getList();
