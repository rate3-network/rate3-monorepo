const rp = require('request-promise');
const StellarSdk = require('stellar-sdk');
const Web3 = require('web3');

const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const web3 = new Web3('https://rinkeby.infura.io/v3/54add33f289d4856968099c7dff630a7');

/**
 * @class Account
 * This is a wrapper class over stellar and ethereum accounts.
 * For those fields/methods that are already there when the original
 * account is passed in, this class simply extracts them;
 * Otherwise, the fields/methods are created and saved in this class.
 */
class Account {
  /**
  * constructor
  * @param {string} network
  */
  constructor(network) {
    switch (network) {
      case 'stellar':
        this.network = 'stellar';
        this.testAddress = 'https://horizon-testnet.stellar.org/accounts/';
        StellarSdk.Network.useTestNetwork();
        break;
      case 'ethereum':
        this.network = 'ethereum';
        break;
      default:
        console.log('The name of the network must be stellar or ethereum.');
    }
  }

  /**
   * This is for stellar only
   * @param {string} assetName
   * @param {string} issuerPublickey
   * @param {string} limit
   * @returns {object|null} xdr.ChangeTrustOp if succeeds or null otherwise
   */
  async changeTrust(assetName, issuerPublickey, limit) {
    switch (this.network) {
      case 'stellar': {
        const newAsset = new StellarSdk.Asset(assetName, issuerPublickey);
        const receiver = await server.loadAccount(this.getAddress());
        const transaction = new StellarSdk.TransactionBuilder(receiver)
          .addOperation(StellarSdk.Operation.changeTrust({
            asset: newAsset,
            limit,
          }))
          .build();
        transaction.sign(this.account);
        return server.submitTransaction(transaction);
      }
      case 'ethereum':
        console.log('Change trust is not for ethereum.');
        break;
      default:
        console.log('The network is not set correctly.');
    }
    return null;
  }

  /**
  * set the balance field of this account
  * @param {string} publicKey - the publick key of the account
  */
  async loadBalance(publicKey) {
    try {
      const response = await rp(this.testAddress + publicKey);
      this.balance = JSON.parse(response).balances.slice(-1)[0].balance;// XLM balance
    } catch (err) {
      console.log('Error in loading balance');
    }
  }

  /**
   * Set the account field of this account to be the argument;
   * For Stellar, upload it to the testnet and update the balance;
   * For Ethereum, update its balance read on the Rinbeky testnet.
   * @param {object} account - A stellar or ethereum account
   */
  async setAccount(originalAccount) {
    switch (this.network) {
      case 'stellar':
        this.account = originalAccount;
        await this.loadBalance(this.getAddress());
        if (this.balance === '0.0000000' || this.balance === undefined) {
          try {
            await rp({
              url: 'https://friendbot.stellar.org',
              qs: { addr: this.getAddress() },
              json: true,
            });
            await this.loadBalance(this.getAddress());
          } catch (err) {
            console.log(err);
          }
        }
        break;
      case 'ethereum': {
        this.account = originalAccount;
        const response = await web3.eth.getBalance(originalAccount.address);
        if (typeof response === 'string') {
          this.balance = response;
        } else {
          console.log('Cannot get the eth balance');
        }
        break;
      }
      default:
        this.account = null;
        console.log('The account network is not correctly set.');
    }
  }

  /**
   * Sign the data using the private key of the current account
   * @param {string} data - the data (string) to be signed
   * @returns {object} the signed object
   */
  sign(data) {
    switch (this.network) {
      case 'stellar':
        if (this.account.canSign()) {
          return this.account.sign(data);
        }
        console.log('The Stellar account does not contain a private key and cannot sign');
        return null;
      case 'ethereum':
        return web3.eth.accounts.sign(data, this.getPrivateKey());
      default:
        console.log('The network is not correct');
        return null;
    }
  }

  /**
   * Send an amount from the current account to another account
   * @param {string} to - the address that recerives XLM/ETH
   * @param {string} amount - the amount of XLM/ETH sent; e.g. 100XLM; 0.01 eth
   * @returns {object} the server response of the transaction
   */
  async send(to, amount) {
    try {
      switch (this.network) {
        case 'stellar': {
          await server.loadAccount(to);
          const accontOnTestnet = await server.loadAccount(this.getAddress());
          const transaction = new StellarSdk.TransactionBuilder(accontOnTestnet)
            .addOperation(StellarSdk.Operation.payment({
              destination: to,
              asset: StellarSdk.Asset.native(),
              amount,
            })).build();
          transaction.sign(this.account);
          return await server.submitTransaction(transaction);
        }

        case 'ethereum': {
          const rawTransaction = {
            from: this.getAddress(),
            to,
            value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')), // e.g. '0.001'
            gas: 30000,
            chainId: 4, // https://ethereum.stackexchange.com/questions/17051/how-to-select-a-network-id-or-is-there-a-list-of-network-ids
          };

          const signedTx = await this.account.signTransaction(rawTransaction);
          const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
          return receipt;
        }
        // infura accepts only raw transactions, because it does not handle private keys
        default:
          console.log('The network is not correct');
      }
    } catch (err) {
      console.log('ethereum send transaction error', err);
      return null;
    }
    return null;
  }

  /**
   * This methods sets the history field of this account.
   * All the fields in the response are retained, in JSON format
   * for users of this package to select.
   * The format for Stellar and Ethereum are different.
   * @returns {JSON} the transaction history
   */
  async receive() {
    try {
      switch (this.network) {
        case 'stellar': {
          const url = `https://horizon-testnet.stellar.org/accounts/${this.getAddress()}/payments`;
          const response = await rp(url);
          this.history = JSON.parse(response)._embedded.records;
          return this.history;
        }
        case 'ethereum': {
          const url = `http://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=${this.getAddress()}&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken`;
          const response = await rp(url);
          this.history = JSON.parse(response).result;
          return this.history;
        }
        default:
          console.log('The network is not correct');
          return null;
      }
    } catch (err) {
      console.log('error in fetching history', err);
    }
    return null;
  }

  /**
   * Construct the transaction from the uri (stellar), and sign it with the current account
   * Return the signed transaction
   * For ethereum, take the transaction hash, and sign it;
   * Use the getter to get the signed transaction
   * @param {string} uri - the input uri (stellar); tx hash (ethereum)
   * @returns {transaction} the signed transaction
   */
  async delegatedSigning(uri) {
    try {
      switch (this.network) {
        case 'stellar': {
          const txEnvelope = StellarSdk.xdr.TransactionEnvelope.fromXDR(uri.slice(19), 'base64');
          // web+stellar:tx?xdr=... the xdr starts from position 19 of the string
          const tx1 = new StellarSdk.Transaction(txEnvelope);
          tx1.sign(this.account);
          return tx1;
        }
        case 'ethereum': {
          // tx '0x793aa73737a2545cd925f5c0e64529e0f422192e6bbdd53b964989943e6dedda'
          const tx = await web3.eth.getTransaction(uri); // uri here is the transaction hash
          return web3.eth.accounts.signTransaction(tx, this.getPrivateKey());
        }
        default:
          console.log('The network is not correct');
          return null;
      }
    } catch (err) {
      console.log('Error in delegated signing', err);
    }
    return null;
  }

  /**
   * Currently for Stellar only
   * Request a challenge to verify this account from the end point
   * @param {string} webAuthEndpoint - The url that is the web auth end point
   * @returns {string|null} the string of XDR endcoded transaction, or null if failed
   */
  async getAuthenticationChallenge(webAuthEndpoint) {
    try {
      switch (this.network) {
        case 'stellar': {
          this.webAuthEndpoint = webAuthEndpoint;// save it for the post method
          const options = {
            uri: webAuthEndpoint,
            qs: {
              account: this.getAddress(),
            },
            json: true, // Automatically parses the JSON string in the response
          };
          const response = await rp(options);
          return response.transaction;
        }
        case 'ethereum': {
          console.log('Web authentication for Ethereum currently not required');
          return null;
        }
        default:
          console.log('The network is not correct');
          return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * Takes an XDR encoded transaction, build a transaction and sign it.
   * @param {JSON} transaction
   * @returns {string|null}the signed transaction XDR encoded, or null if failed
   */
  signAuthenticationChallenge(transaction) {
    // build the transaction
    const txEnvelope = StellarSdk.xdr.TransactionEnvelope.fromXDR(transaction, 'base64');
    const tx1 = new StellarSdk.Transaction(txEnvelope);
    // sign it
    tx1.sign(this.account);
    return tx1.toEnvelope().toXDR('base64');
  }

  /**
   * Send the signed transaction XDR to the server, which is saved before
   * @param {string} signedTransaction - the XDR encoded signed transaction
   * @returns {object|null}the JWT token, if verification on the server is successful
   * otherwise null
   */
  async sendSignedAuthentication(signedTransaction) {
    try {
      const options = {
        method: 'POST',
        uri: this.webAuthEndpoint,
        body: {
          transaction: signedTransaction,
        },
        json: true, // Automatically stringifies the body to JSON
      };
      const response = await rp(options);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * Return the network where the account is.
   * @returns the network where the account is
   */
  getNetwork() {
    return this.network;
  }

  /**
   * Get the balance associated to this account.
   * Currently only values for XLM and ETH are saved.
   * i.e. there is no other types of currency.
   * @returns {string} the balance associated to this account in string format.
   */
  getBalance() {
    return this.balance;
  }

  /**
   * Get transaction history in and out from this account.
   * Currently it is the raw json response, and
   * different between eth and stellar.
   * @returns {JSON} transaction history in and out from this account
   */
  getHistory() {
    return this.history;
  }

  /**
   * Get the account that is passed into this wrapper class.
   * @returns {object} the account that is passed into this wrapper class
   */
  getOriginalAccount() {
    return this.account;
  }

  /**
   * The address of a stellar account is the public key of the key pair;
   * The address of an ethereum account is a part of the hash of the public key
   * @returns {string} the address
   */
  getAddress() {
    switch (this.network) {
      case 'stellar':
        return this.account.publicKey();
      case 'ethereum':
        return this.account.address;
      default:
        console.log('The network is not set correctly.');
        return null;
    }
  }

  /**
   * Return the private key (ethereum) / secret (stellar)
   * @returns {string} the private key
   */
  getPrivateKey() {
    switch (this.network) {
      case 'stellar':
        return this.account.secret();
      case 'ethereum':
        return this.account.privateKey;
      default:
        console.log('The network is not set correctly.');
        return null;
    }
  }

  // Phase 3 Anchor Bridge, client side implementation of SEP-0006
  // They should be static functions, having no relation with this account

  /**
   * Deposit external assets with an anchor.
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
        asset_code, account, memo_type, memo, email_address, type,
      };
      // eslint-disable-next-line no-restricted-syntax
      for (const property in qsConstruct) {
        if (!qsConstruct[property]) {
          delete qsConstruct[property];
        }
      }
      // verifies that the parameters are valid
      if (account.charAt(0) !== 'G') {
        console.log('The account must start with letter G.');
        return null;
      }
      const options = {
        uri: `${this.anchorUrl}/deposit`,
        qs: qsConstruct, // query params
        json: true, // Automatically stringifies the body to JSON
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
        asset_code, dest, dest_extra, account, memo_type, memo, type,
      };
      // eslint-disable-next-line no-restricted-syntax
      for (const property in qsConstruct) {
        if (!qsConstruct[property]) {
          delete qsConstruct[property];
        }
      }
      // verifies that the parameters are valid
      if (account && account.charAt(0) !== 'G') {
        console.log('The account must start with letter G.');
        return null;
      }
      const options = {
        uri: `${this.anchorUrl}/withdraw`,
        qs: qsConstruct,
        json: true, // Automatically stringifies the body to JSON
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
        json: true, // Automatically stringifies the body to JSON
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
        asset_code, account, no_older_than, limit, paging_id,
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
        json: true, // Automatically stringifies the body to JSON
      };
      const response = await rp(options);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = Account;
