import { PENDING_REVIEW, PENDING_ADD, VERIFIED } from '../constants/general';

class Identity {
  constructor(id, value) {
    this.id = id;
    this.value = value;
    this.status = PENDING_REVIEW;
    this.signature = '';
    this.txHash = '';
  }

  approveIdentity(sig) {
    if (this.status !== PENDING_REVIEW) {
      throw new Error('The Identity has already been approved!');
    } else {
      this.signature = sig;
      this.status = PENDING_ADD;
    }
  }

  addIdentity(hash) {
    if (this.status !== PENDING_ADD) {
      throw new Error('The Identity has already been added or it has not been approved!');
    } else {
      this.status = VERIFIED;
      this.txHash = hash;
    }
  }
}

export default Identity;