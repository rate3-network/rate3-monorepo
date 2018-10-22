const rp = require('request-promise');
const StellarSdk = require('stellar-sdk');
const openurl = require('openurl');
const toml = require('toml');
const setting = require('./setting');


class Anchor {
  /**
   * @constructor - currently the anchor only supports Stellar
   * @param {string} network - the network of the anchor
   */
  constructor(network) {
    switch (network) {
      case 'stellar':
        this.network = 'stellar';
        this.testAddress = `${setting.horizonEndpoint}/accounts/`;
        StellarSdk.Network.useTestNetwork();
        this.balance = -1;
        break;
      default:
        console.log('The name of the network must be stellar.');
    }
  }

  // Phase 3 Anchor Bridge, client side implementation of SEP-0006
  // They should be static functions, having no relation with this account

  /**
   * The url of transfer server can be found in the stellar.toml file
   * if it is not known.
   * @param {string} domain - domain of the Stellar anchor
   * @returns {string|error} the url of the transfer server in stellar.toml
   * or error if an error occurs
   */
  async getTransferServerUrl(domain) {
    try {
      this.stellarTomlUrl = `https://${domain}/.well-known/stellar.toml`;
      const stellarToml = await rp(this.stellarTomlUrl);
      this.transferServer = toml.parse(stellarToml).TRANSFER_SERVER;
      return this.transferServer;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  /**
   * Deposit external assets with an anchor. The anchor then sends to user's Stellar account
   * Parameter descriptions are from SEP-0006.
   * The parameter naming follows SEP-0006, and does not use camel case
   * @param {string} url - the url of this get request, without slash at the end
   * @param {string} asset_code - The code of the asset the user is wanting to deposit with
   * the anchor. Ex BTC,ETH,USD,INR,etc
   * @param {string} account - The stellar account ID of the user that wants to deposit.
   * This is where the asset token will be sent.
   * @param {string} memo_type - (optional) type of memo that anchor should attach to the Stellar
   *  payment transaction, one of text, id or hash
   * @param {string} memo - (optional) value of memo to attach to transaction,
   * for hash this should be base64-encoded.
   * @param {string} email_address - (optional) Email address of depositor.
   * If desired, an anchor can use this to send email updates to the user about the deposit.
   * @param {string} type - (optional) Type of deposit. If the anchor supports
   *  multiple deposit methods (e.g. SEPA or SWIFT), the wallet should specify type.
   */
  async getDeposit(url, asset_code, account, memo_type = null, memo = null,
    email_address = null, type = null) {
    this.anchorUrl = url;
    try {
      const qsConstruct = {
        asset_code, account, memo_type, memo, email_address, type
      };
      // eslint-disable-next-line no-restricted-syntax
      for (const property in qsConstruct) {
        if (!qsConstruct[property]) {
          delete qsConstruct[property];
        }
      }
      // verifies that the parameters are valid
      if (account.charAt(0) !== 'G') {
        console.log(setting.stellarPublicKeyDebug);
        return null;
      }
      const options = {
        uri: `${this.anchorUrl}/deposit`,
        qs: qsConstruct, // query params
        json: true // Automatically stringifies the body to JSON
      };
      const response = await rp(options);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * Withdraw assets from an anchor
   * @param {string} url - the url of this get request, without slash at the end
   * @param {string} type - Type of withdrawal. Can be: crypto, bank_account, cash, mobile,
   *  bill_payment or other custom values
   * @param {string} asset_code - Code of the asset the user wants to withdraw
   * @param {string} dest - The account that the user wants to withdraw their funds to.
   *  This can be a crypto account, a bank account number, IBAN, mobile number, or email address.
   * @param {string} dest_extra - (optional) Extra information to specify withdrawal location.
   *  For crypto it may be a memo in addition to the dest address. It can also be a routing number
   *  for a bank, a BIC, or the name of a partner handling the withdrawal.
   * @param {string} account - (optional) The stellar account ID of the user that wants to do
   *  the withdrawal. This is only needed if the anchor requires KYC information for withdrawal.
   *  The anchor can use account to look up the user's KYC information.
   * @param {string} memo - (optional) A wallet will send this to uniquely identify a user
   *  if the wallet has multiple users sharing one Stellar account. The anchor can use this
   *  along with account to look up the user's KYC info.
   * @param {string} memo_type - (optional) type of memo. One of text, id or hash
   */
  async getWithdraw(url, type, asset_code, dest, dest_extra = '', account = '', memo = '', memo_type = '') {
    this.anchorUrl = url;
    try {
      const qsConstruct = {
        asset_code, dest, dest_extra, account, memo_type, memo, type
      };
      // eslint-disable-next-line no-restricted-syntax
      for (const property in qsConstruct) {
        if (!qsConstruct[property]) {
          delete qsConstruct[property];
        }
      }
      // verifies that the parameters are valid
      if (account && account.charAt(0) !== 'G') {
        console.log(setting.stellarPublicKeyDebug);
        return null;
      }
      const options = {
        uri: `${this.anchorUrl}/withdraw`,
        qs: qsConstruct,
        json: true // Automatically stringifies the body to JSON
      };
      const response = await rp(options);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // have not handled interactive/non-interactive customer information needed response
  // and not accepted, error

  /**
   * Allows an anchor to communicate basic info about what
   * their TRANSFER_SERVER supports to wallets and clients.
   * @param {string} url - the url of this get request, without slash at the end
   * @param {string} lang - (optional) Defaults to en. Language code specified using ISO 639-1.
   * description fields in the response should be in this language
   */
  async getInfo(url, lang = 'en') {
    this.anchorUrl = url;
    try {
      const qsConstruct = {};
      if (lang !== 'en') {
        qsConstruct.lang = lang;
      }
      const options = {
        uri: `${this.anchorUrl}/info`,
        qs: qsConstruct,
        json: true // Automatically stringifies the body to JSON
      };
      const response = await rp(options);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * View history of deposits and withdrawals involving the user
   * @param {string} url - the url of this get request, without slash at the end
   * @param {string} asset_code - The code of the asset of interest. E.g. BTC,ETH,USD,INR,etc
   * @param {string} account - The stellar account ID involved in the transactions
   * @param {string} no_older_than - (optional) The response should contain transactions
   *  starting on or after this date & time
   * @param {int} limit - (optional) the response should contain at most limit transactions
   * @param {string} paging_id - (optional) the response should contain transactions
   *  starting prior to this ID (exclusive)
   */
  async getTransactionHistory(url, asset_code, account, no_older_than = '', limit = '', paging_id = '') {
    this.anchorUrl = url;
    try {
      const qsConstruct = {
        asset_code, account, no_older_than, limit, paging_id
      };
      // eslint-disable-next-line no-restricted-syntax
      for (const property in qsConstruct) {
        if (!qsConstruct[property]) {
          delete qsConstruct[property];
        }
      }
      const options = {
        uri: `${this.anchorUrl}/transactions`,
        qs: qsConstruct,
        json: true // Automatically stringifies the body to JSON
      };
      const response = await rp(options);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // response 403 non-interactive requires implementatoin
  // of SEP-0012, which is not handled here

  // response 403 account information rejected, this is also not handled
  // as it may be because the account info is wrong,
  // and the caller needs to correct that.

  /**
   * Implementation of handling response 403 interactive
   * as described in SEP 0006
   * @param {JSON} response - The response 403, and it is interactive
   * @returns {boolean|error} true if succeeds, error otherwise
   */
  // eslint-disable-next-line class-methods-use-this
  handleInteractiveResponse(response) {
    try {
      openurl.open(response.url);
    } catch (error) {
      return error;
    }
    return true;
  }
}

module.exports = Anchor;
