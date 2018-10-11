const Eth = require('@ledgerhq/hw-app-eth');
const Str = require('@ledgerhq/hw-app-str');
const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid');

/**
 * The class wraps api from @ledgerhq,
 * with ES 6 async/aswait syntax
 */
class Ledger {
  /**
   * the params for trezor-connect api are key-value pairs inside Object
   * @param {string} currency - Stellar or Ethereum only
   */
  constructor(currency) {
    this.currency = currency;
  }

  /**
   * Get the version of the app
   * @returns {string} the version of the app
   */
  async getAppVersion() {
    let result;
    const transport = await TransportNodeHid.create();
    if (this.currency === 'Stellar') {
      const str = new Str(transport);
      result = await str.getAppConfiguration();
    } else {
      const eth = new Eth(transport);
      result = await eth.getAppConfiguration();
    }
    result = result.version;
    return result;
  }

  /**
   * Get public key (Stellar) / object containing public key, address and
   * chain code (Ethereum)
   * @param {string} path - the path deriving the account
   * @param {boolean} boolDisplay
   * @param {boolean} boolValidateChaincode - boolValidate for Stellar, chaincode for Ethereum
   * @returns {string|object} public key string (Stellar),
   *  or object of public key, address and chaincode (Ethereum)
   */
  async getPublicKey(path, boolDisplay, boolValidateChaincode) {
    let result;
    const transport = await TransportNodeHid.create();
    if (this.currency === 'Stellar') {
      const str = new Str(transport);
      result = await str.getPublicKey(path, boolValidateChaincode, boolDisplay); // "44'/148'/0'"
      result = result.publicKey;
    } else {
      const eth = new Eth(transport);
      result = await eth.getAddress(path, boolDisplay, boolValidateChaincode);
    }
    return result;
  }

  /**
   * @param {string} path - the path deriving the account
   * @param {string|Buffer} transaction - transaction buffer (Stellar) or raw tx hex (Ethereum)
   * @returns {string|object} - signature (Stelar) or object containing s, v, r value (Ethereum)
   */
  async signTransaction(path, transaction) {
    let result;
    const transport = await TransportNodeHid.create();
    if (this.currency === 'Stellar') {
      const str = new Str(transport);
      result = str.signTransaction(path, transaction);
      result = result.signature;
    } else {
      const eth = new Eth(transport);
      result = await eth.signTransaction(path, transaction);
    }
    return result;
  }

  /**
   * This methods is similar to sign transactions except that
   * the input is a message, not a transaction
   * @param {string} path - the path deriving the account
   * @param {Buffer|string} message - message buffer (Stellar) or message hex (Ethereum)
   * @returns {string|object} - - signature (Stelar) or object containing s, v, r value (Ethereum)
   */
  async signMessage(path, message) {
    let result;
    const transport = await TransportNodeHid.create();
    if (this.currency === 'Stellar') {
      const str = new Str(transport);
      result = str.signHash(path, message);
      result = result.signature;
    } else {
      const eth = new Eth(transport);
      result = await eth.signTransaction(path, message);
    }
    return result;
  }
}

module.exports = Ledger;
