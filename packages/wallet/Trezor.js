const TrezorConnect = require('trezor-connect').default;

/**
 * The class wraps api from trezor-connect
 * with ES6 async/await syntax
 */
class Trezor {
  /**
   * the params for trezor-connect api are key-value pairs inside Object
   * @param {string} currency - Stellar or Ethereum only
   */
  constructor(currency) {
    this.currency = currency;
    this.hardware = 'trezor';
  }

  /**
   * derivation path for Ethereum (BIP44):
   * "m/44'/60'/i'", i = 0,1,2...
   * for Stellar:
   * "m/44'/148'/i'", i = 0,1,2...
   * "m/44'/1'/0'/0'/i'", i = 0,1,2...
   * @param {string} path - derivation path
   * @returns {JSON} containing address, path, serialized path or error if failed
   */
  async getPublicKey(path) {
    let result;
    const params = { path };
    if (this.currency === 'ethereum') {
      result = await TrezorConnect.ethereumGetAddress(params);
    } else {
      result = await TrezorConnect.stellarGetAddress(params);
    }
    return result;
  }

  /**
   * sign a transaction
   * @param {string} path - The derivation path of the signing account
   * @param {string} networkPassphrase - specific to Stellar
   * @param {object} transaction - the transaction to sign
   * The transaction object differs for Stellar and Ethereum
   * @returns {JSON} JSON containing the public key and signature (Stellar)
   * / v,r,s (Ethereum) or error
   */
  async signTransaction(path, networkPassphrase, transaction) {
    let result;
    const paramsStellar = { path, networkPassphrase, transaction };
    const paramsEthereum = { path, transaction };
    if (this.currency === 'ethereum') {
      result = await TrezorConnect.ethereumSignTransaction(paramsEthereum);
    } else {
      result = await TrezorConnect.stellarSignTransaction(paramsStellar);
    }
    return result;
  }

  /**
   * This methods is for Ethereum only.
   * @param {string} path - the path of the account to sign
   * @param {string} message - the message to sign
   * @param {boolean} hex - whether the signed message is converted to hex
   * @returns {JSON|boolean} containing the address and signature, or false if failed
   */
  async signMessage(path, message, hex = false) {
    let result;
    if (this.currency === 'ethereum') {
      const params = { path, message, hex };
      result = await TrezorConnect.ethereumSignMessage(params);
    } else {
      console.log('Stellar Signing messages is not supported by Trezor.');
      result = false;
    }
    return result;
  }

  /**
   * verify message, which is only for Ethereum
   * @param {string} address - the singer address, "0x" prefix is optional
   * @param {string} message - the message to verify
   * @param {string} signature -  signature in hexadecimal format. "0x" prefix is optional
   * @param {boolean} hex - whether to convert message *from* hex
   * @returns {JSON} success or error message
   */
  async verifyMessage(address, message, signature, hex = false) {
    let result;
    if (this.currency === 'ethereum') {
      const params = {
        address, message, signature, hex
      };
      result = await TrezorConnect.ethereumVerifyMessage(params);
    } else {
      console.log('Stellar verifying messages is not supported by Trezor.');
      result = false;
    }
    return result;
  }
}

module.exports = Trezor;
