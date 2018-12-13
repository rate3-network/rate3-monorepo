import Crypto from 'crypto';

export function makePreimageHashlockPair() {
    const preimage = Crypto.randomBytes(32);
    const h = Crypto.createHash('sha256');
    h.update(preimage);
    const hashlock = h.digest();
    return { preimage, hashlock };
}

export function makeTimestamp(afterInSeconds) {
    return Math.round((new Date()).getTime() / 1000) + afterInSeconds; 
} 