import { PENDING_REVIEW, PENDING_ADD, VERIFIED } from '../constants/general';

class Identity {
  constructor(value, type, user, verifier, signature, txHash, claimId, status = PENDING_REVIEW) {
    this.value = value;
    this.type = type;
    this.user = user;
    this.verifier = verifier;
    this.status = status;
    this.signature = signature;
    this.txHash = txHash;
    this.claimId = claimId;
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
