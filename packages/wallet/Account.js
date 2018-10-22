const rp = require('request-promise');
const StellarSdk = require('stellar-sdk');
const Web3 = require('web3');
const setting = require('./setting');

const server = new StellarSdk.Server(setting.horizonEndpoint);
const web3 = new Web3(setting.infuraUrl);

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
  * Setting balance to -1, to differentiate from accounts with 0 balance
  * @param {string} network
  */
  constructor(network) {
    switch (network) {
      case 'stellar':
        this.network = 'stellar';
        this.testAddress = 'https://horizon-testnet.stellar.org/accounts/';
        StellarSdk.Network.useTestNetwork();
        this.balance = -1;
        break;
      case 'ethereum':
        this.network = 'ethereum';
        this.balance = -1;
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
            limit
          }))
          .build();
        transaction.sign(this.nativeAccount);
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
  async setAccount(account) {
    switch (this.network) {
      case 'stellar':
        this.nativeAccount = account;
        await this.loadBalance(this.getAddress());
        if (this.balance === '0.0000000' || this.balance === undefined) {
          try {
            await rp({
              url: 'https://friendbot.stellar.org',
              qs: { addr: this.getAddress() },
              json: true
            });
            await this.loadBalance(this.getAddress());
          } catch (err) {
            console.log(err);
          }
        }
        break;
      case 'ethereum': {
        this.nativeAccount = account;
        const response = await web3.eth.getBalance(this.nativeAccount.address);
        if (typeof response === 'string') {
          this.balance = response;
        } else {
          console.log('Cannot get the eth balance');
        }
        break;
      }
      default:
        this.nativeAccount = null;
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
        if (this.nativeAccount.canSign()) {
          return this.nativeAccount.sign(data);
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
              amount
            })).build();
          transaction.sign(this.nativeAccount);
          return await server.submitTransaction(transaction);
        }

        case 'ethereum': {
          const rawTransaction = {
            from: this.getAddress(),
            to,
            value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')), // e.g. '0.001'
            gas: 30000,
            chainId: 4 // https://ethereum.stackexchange.com/questions/17051/how-to-select-a-network-id-or-is-there-a-list-of-network-ids
          };

          const signedTx = await this.nativeAccount.signTransaction(rawTransaction);
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
          tx1.sign(this.nativeAccount);
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
              account: this.getAddress()
            },
            json: true // Automatically parses the JSON string in the response
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
    tx1.sign(this.nativeAccount);
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
          transaction: signedTransaction
        },
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
    return this.nativeAccount;
  }

  /**
   * The address of a stellar account is the public key of the key pair;
   * The address of an ethereum account is a part of the hash of the public key
   * @returns {string} the address
   */
  getAddress() {
    switch (this.network) {
      case 'stellar':
        return this.nativeAccount.publicKey();
      case 'ethereum':
        return this.nativeAccount.address;
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
        return this.nativeAccount.secret();
      case 'ethereum':
        return this.nativeAccount.privateKey;
      default:
        console.log('The network is not set correctly.');
        return null;
    }
  }
}

module.exports = Account;
