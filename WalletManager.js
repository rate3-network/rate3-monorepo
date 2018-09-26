const bip39 = require('bip39');
const forge = require('node-forge');
const hdkey = require('ethereumjs-wallet/hdkey');
const stellarHDWallet = require('stellar-hd-wallet');
const StellarSdk = require('stellar-sdk');
const Web3 = require('web3');

const web3 = new Web3('https://rinkeby.infura.io/v3/54add33f289d4856968099c7dff630a7');

const Account = require('./Account');

/** This is a wrapper class over stellar and ethereum wallets */
class WalletManager {
  /**
   * Set the network of the wallet manager
   * @param {string} network - stellar or ethereum
   */
  constructor(network) {
    switch (network) {
      case 'stellar':
      case 'ethereum':
        this.network = network;
        this.accountArray = [];
        break;
      default:
        console.log('The name of the network must be stellar or ethereum.');
    }
  }

  /**
   * Change to a new network. If the input is invalid, it will not change.
   * @param {string} network - The name of the network, 'stellar' or 'ethereum'
   */
  changeNetwork(network) {
    switch (network) {
      case 'stellar':
      case 'ethereum':
        this.network = network;
        this.accountArray = []; // discard the accounts in another network
        this.account = null;
        break;
      default:
        console.log('The name of the network must be stellar or ethereum.');
    }
  }

  /**
   * Return the name of the current network
   */
  getNetwork() {
    if (this.network == null) {
      console.log('The network of the wallet manager is not set.');
      return null;
    }
    return this.network;
  }

  /**
   * If the argument is empty, generate random seed phrases (12 words).
   * If the arugment is a number, generate that number of seed phrases.
   * If the argument is a string of seed phrases, use it.
   */
  setSeed() {
    if (arguments.length === 0) {
      // generate seed; both network uses the same bip39 module to generate seed phrases
      switch (this.network) {
        case 'stellar':
        case 'ethereum':
          this.seed = bip39.generateMnemonic();
          // default strength = 128, 12 words
          // 160 - 18 words; 224 - 21 words; 256 - 24 words
          break;
        default:
          this.seed = null;
          console.log('The network has not been set.');
      }
    } else if (arguments.length === 1) {
      if ([12, 18, 21, 24].includes(arguments[0])) {
        const strength = (function toBits(numberOfWords) {
          switch (numberOfWords) {
            case 12:
              return 128;
            case 18:
              return 160;
            case 21:
              return 224;
            case 24:
              return 256;
            default:
              return 128;
          }
        }(arguments[0]));
        this.seed = bip39.generateMnemonic(strength);
      } else if (typeof (arguments[0]) === 'string') {
        if (bip39.validateMnemonic(arguments[0])) {
          this.seed = arguments[0];
        } else {
          this.seed = null;
          console.log('The input is not a set of valid seed phrases.');
        }
      } else {
        this.seed = null;
        console.log('The number of seed phrases must be one of 12, 18, 21, 24.');
      }
    } else {
      console.log('The argument must be empty, number of seed phrases, or valid seed phrases.');
    }
    return this.seed;
  }

  /**
   * Return the current seed
   */
  getSeed() {
    if (this.seed == null) {
      console.log('The seed of the wallet is not set.');
      return null;
    }
    return this.seed;
  }

  /**
   * Generate the wallet based on the seed
   */
  setWallet() {
    switch (this.network) {
      case 'stellar':
        this.wallet = stellarHDWallet.fromMnemonic(this.seed);
        break;
      case 'ethereum':
        this.wallet = hdkey.fromMasterSeed(this.seed);
        break;
      default:
        this.wallet = null;
        console.log('The seed is not specified or not valid.');
    }
    return this.wallet;
  }

  /**
   * Return the current wallet
   */
  getWallet() {
    if (this.wallet == null) {
      console.log('The wallet is not set.');
      return null;
    }
    return this.wallet;
  }

  /**
   * Before generating accounts, the seed and wallet MUST be there.
   * i.e., random account generatation is NOT allowed.
   * If the wallet is set, generate the first (0) account in the wallet;
   * If the parameter is a number,
   * Generate the account in the wallet. Its index is the number.
   * If the parameter is a string,
   * Use it as the private/public key to generate the account
   */
  async getAccount() {
    if (arguments.length === 0) {
      if (this.wallet == null) {
        console.log('The wallet is not initialized.');
        return null;
      }
      // generate the 0th account in the wallet
      switch (this.network) {
        case 'stellar': {
          this.account = new Account(this.network);
          await this.account.setAccount(this.wallet.getKeypair(0));
          this.accountArray.push(Object.assign({}, this.account));
          return this.account;
        }
        case 'ethereum': {
          const privateKey = `0x${this.wallet.deriveChild(0).getWallet()._privKey.toString('hex')}`;
          this.account = new Account(this.network);
          await this.account.setAccount(web3.eth.accounts.privateKeyToAccount(privateKey));
          this.accountArray.push(Object.assign({}, this.account));
          return this.account;
        }
        default:
          console.log('The network is not set.');
          return null;
      }
    }
    if (arguments.length === 1 && Number.isInteger(arguments[0]) && arguments[0] > 1) {
      // generate the account of the wallet at the specified index
      switch (this.network) {
        case 'stellar': {
          this.account = new Account(this.network);
          await this.account.setAccount(this.wallet.getKeypair(arguments[0]));
          this.accountArray.push(Object.assign({}, this.account));
          break;
        }
        case 'ethereum': {
          const privateKey = `0x${this.wallet.deriveChild(arguments[0]).getWallet()._privKey.toString('hex')}`;
          this.account = new Account(this.network);
          await this.account.setAccount(web3.eth.accounts.privateKeyToAccount(privateKey));
          this.accountArray.push(Object.assign({}, this.account));
          break;
        }
        default:
          this.account = null;
          console.log('The network has not been set.');
      }
      return this.account;
    }
    if (arguments.length === 1 && typeof (arguments[0]) === 'string') {
      try {
        switch (this.network) {
          case 'stellar': {
            if (arguments[0].charAt(0) === 'S') {
              // generate account from private key
              this.account = new Account(this.network);
              await this.account.setAccount(StellarSdk.Keypair.fromSecret(arguments[0]));
              this.accountArray.push(Object.assign({}, this.account));
            } else {
              this.account = null;
              console.log('The starting char must be S (private key)');
            }
            break;
          }
          case 'ethereum': {
            this.account = new Account(this.network);
            await this.account.setAccount(web3.eth.accounts.privateKeyToAccount(arguments[0]));
            this.accountArray.push(Object.assign({}, this.account));
            break;
          }
          default:
            this.account = null;
            console.log('The network has not been set.');
        }
        return null;
      } catch (err) {
        console.log('The input is not a valid private/public key.');
        return null;
      }
    } else {
      console.log('The argument must be empty, or 0,1,2,...');
      return null;
    }
  }

  /**
   * A shorthand for creating multiple accounts.
   * The accounts created will be the 0th, 1st, ... (n-1)th in the wallet
   * @param {int} numberOfAccounts
   */
  async setMultipleAccounts(numberOfAccounts) {
    for (let i = 0; i < numberOfAccounts; i++) {
      await this.getAccount(i);
    }
  }

  /**
   * Set the current account.
   * @param {number} index - The index of the account in the accountArray
   */
  setCurrentAccount(index) {
    const max = this.accountArray.length - 1;
    if (index > max) {
      console.log(`the maximum index is${max.toString()}`);
    } else {
      this.account = this.accountArray[index];
    }
  }

  /**
   * Return the account array.
   * The index of accounts in this array can be different from the index
   * of the account in the wallet,
   * depending on the sequence the accounts are created.
   */
  getAccountArray() {
    if (this.accountArray == null) {
      console.log('The account array is empty');
      return null;
    }
    return this.accountArray;
  }

  /**
   * @param {object} account - The account to be encrypted. Only the private key will be encrypted.
   * @param {string} password - The password string used to encrypt the private key
   * If on stellar, return the encrypted private key;
   * If on ethereum, return the keystore V3 JSON.
   * Plus all the auxiliary fields
   */
  encrypt(account, password) {
    switch (account.network) {
      case 'stellar': {
        // AES key and IV sizes
        const keySize = 24;
        const ivSize = 8;
        // get derived bytes
        const salt = forge.random.getBytesSync(8);
        const derivedBytes = forge.pbe.opensslDeriveBytes(
          password, salt, keySize + ivSize,
        ); /* , md */
        const buffer = forge.util.createBuffer(derivedBytes);
        const key = buffer.getBytes(keySize);
        const iv = buffer.getBytes(ivSize);
        const cipher = forge.cipher.createCipher('AES-CBC', key);
        cipher.start({ iv });
        cipher.update(forge.util.createBuffer(account.getPrivateKey(), 'binary'));
        cipher.finish();
        const output = forge.util.createBuffer();
        // if using a salt, prepend this to the output:
        if (salt !== null) {
          output.putBytes('Salted__'); // (add to match openssl tool output)
          output.putBytes(salt);
        }
        output.putBuffer(cipher.output);
        return { original: output, network: this.network, balance: account.balance };
      }

      case 'ethereum':
        return {
          original: web3.eth.accounts.encrypt(account.getPrivateKey(), password),
          network: this.network,
          balance: account.balance,
        };
        // return this.getOriginalAccount().encrypt(this.getPrivateKey(), password)
      default:
        console.log('The network is not correctly set');
        return null;
    }
  }

  /**
   * @param {object} cipher - The encrypted object
   * @param {string} password - The password that is used to encrypt the account
   * Return an account, reconstructed from the cipher
   * The fields remain the same, but methods are not.
   * However, these methods will not be used, i.e. will use web3/stellar libraries.
   */
  decrypt(cipher, password) {
    switch (this.network) {
      case 'stellar': {
        // parse salt from input
        const input = forge.util.createBuffer(cipher.original, 'binary');
        // skip "Salted__" (if known to be present)
        input.getBytes('Salted__'.length);
        // read 8-byte salt
        const salt = input.getBytes(8);
        // AES key and IV sizes
        const keySize = 24;
        const ivSize = 8;
        const derivedBytes = forge.pbe.opensslDeriveBytes(password, salt, keySize + ivSize);
        const buffer = forge.util.createBuffer(derivedBytes);
        const key = buffer.getBytes(keySize);
        const iv = buffer.getBytes(ivSize);
        const decipher = forge.cipher.createDecipher('AES-CBC', key);
        decipher.start({ iv });
        decipher.update(input);
        // const result = decipher.finish(); // check 'result' for true/false
        const decryptedPrivateKey = decipher.output.data;
        const decryptedStellarAccount = new Account(cipher.network);
        decryptedStellarAccount.setAccount(StellarSdk.Keypair.fromSecret(decryptedPrivateKey));
        return decryptedStellarAccount;
      }
      case 'ethereum': {
        const decryptedAccount = new Account(cipher.network);
        decryptedAccount.setAccount(web3.eth.accounts.decrypt(cipher.original, password));
        return decryptedAccount;
      }
      default:
        console.log('The network is not correctly set');
        return null;
    }
  }
}

module.exports = WalletManager;
