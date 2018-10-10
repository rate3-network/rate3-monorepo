class LocalList {
  constructor(prefix, name) {
    this.listName = `${prefix}.${name}`;
    this.store = window.localStorage;
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
