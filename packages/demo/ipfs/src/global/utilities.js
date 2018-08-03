import bs58 from 'bs58';
import GlobalLogger from './GlobalLogger';

export const isValidIPFSHash = (base58Str) => {
  try {
    const hexStr = bs58.decode(base58Str).toString('hex');
    if (hexStr.length < 4) {
      return false;
    }
    const hashLength = parseInt(hexStr.substring(2, 4), 16);
    return hexStr.length === hashLength * 2 + 4;
  } catch (e) {
    GlobalLogger.log(e);
    return false;
  }
};

export const isValidEthAddress = str => (
  str.match(/^0x[a-fA-F0-9]{40}$/) != null
);
