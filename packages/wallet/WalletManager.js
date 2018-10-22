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
      // stellar and ethereum will share the initialization
      case 'stellar':
      case 'ethereum':
        this.network = network;
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
      // stellar and ethereum will share the re-initialization
      case 'stellar':
      case 'ethereum':
        this.network = network;
        this.account = null;
        break;
      default:
        console.log('The name of the network must be stellar or ethereum.');
    }
  }

  /**
   * @returns {string} the name of the current network
   */
  getNetwork() {
    if (!this.isNetworkSet()) {
      console.log('The network of the wallet manager is not set.');
      return null;
    }
    return this.network;
  }

  /**
   * If the argument is empty, generate random seed phrases (12 words).
   * If the argument is a number, generate that number of seed phrases.
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
   * @return {string} the current seed
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
   * @returns {Object} the current wallet
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
   * Use it as the private key to generate the account
   * @returns {Account} the account created/imported
   */
  async getAccount() {
    // stop if the wallet is not set, otherwise continue
    if (this.wallet == null) {
      console.log('The wallet is not initialized.');
      return null;
    }
    if (arguments.length === 0) {
      // generate the 0th account in the wallet
      switch (this.network) {
        case 'stellar': {
          this.account = new Account(this.network);
          await this.account.setAccount(this.wallet.getKeypair(0));
          return this.account;
        }
        case 'ethereum': {
          const privateKey = `0x${this.wallet.deriveChild(0).getWallet()._privKey.toString('hex')}`;
          this.account = new Account(this.network);
          await this.account.setAccount(web3.eth.accounts.privateKeyToAccount(privateKey));
          return this.account;
        }
        default:
          console.log('The network is not set.');
          return null;
      }
    }
    if (arguments.length === 1 && Number.isInteger(arguments[0]) && arguments[0] >= 0) {
      // generate the account of the wallet at the specified index
      switch (this.network) {
        case 'stellar': {
          this.account = new Account(this.network);
          await this.account.setAccount(this.wallet.getKeypair(arguments[0]));
          return this.account;
        }
        case 'ethereum': {
          const privateKey = `0x${this.wallet.deriveChild(arguments[0]).getWallet()._privKey.toString('hex')}`;
          this.account = new Account(this.network);
          await this.account.setAccount(web3.eth.accounts.privateKeyToAccount(privateKey));
          return this.account;
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
              // generate account from private key; the encoding standard is at
              // https://github.com/stellar/js-stellar-base/blob/74ac176199e9f0a5dd16311b80fc116e16ef57ea/src/strkey.js#L8
              this.account = new Account(this.network);
              await this.account.setAccount(StellarSdk.Keypair.fromSecret(arguments[0]));
            } else {
              this.account = null;
              console.log('The starting char must be S (private key)');
            }
            break;
          }
          case 'ethereum': {
            this.account = new Account(this.network);
            await this.account.setAccount(web3.eth.accounts.privateKeyToAccount(arguments[0]));
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
   * A shorthand to multiple accounts.
   * The accounts created correspond to the index array in the wallet
   * These accounts are only returned, not saved
   * @param {Array} indexArray - An array of indexes of accounts to generate
   */
  async getMultipleAccounts(indexArray) {
    const arrayLength = indexArray.length;
    const accountArray = {};
    let newAccount = null;
    if (!this.isNetworkSet()) {
      console.log('The network is not set correctly');
      return false;
    }
    for (let i = 0; i < arrayLength; i++) {
      // generate the account of the wallet at the specified index
      switch (this.network) {
        case 'stellar': {
          newAccount = new Account(this.network);
          await this.account.setAccount(this.wallet.getKeypair(indexArray[i]));
          break;
        }
        case 'ethereum': {
          const privateKey = `0x${this.wallet.deriveChild(indexArray[i]).getWallet()._privKey.toString('hex')}`;
          newAccount = new Account(this.network);
          await this.account.setAccount(web3.eth.accounts.privateKeyToAccount(privateKey));
          break;
        }
        default:
        // the default case actually will not reach, since it is checked above
          console.log('The network has not been set.');
      }
    }
    accountArray.push(newAccount);
    return accountArray;
  }

  /**
   * a helper function to check if the network is set cottectly
   */
  isNetworkSet() {
    return this.network === 'stellar' || this.network === 'ethereum';
  }

  /**
   * The base method for encryption
   * @param {string} data - the data to be encrypted
   * @param {string} password - the password
   * @returns {ByteStringBuffer} the object containing the encrypted string
   */
  encrypt(data, password) {
    // generate a random key and IV
    // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
    // forge uses Fortuna as its pseudorandom number generator, mentioned at the following link
    // https://www.npmjs.com/package/node-forge#prng
    // Ehe seed is added with extra randomness collected from the user, e.g. mouse movement
    this.iv = forge.random.getBytesSync(12);

    // alternatively, generate a password-based 16-byte key
    this.salt = forge.random.getBytesSync(128);
    const key = forge.pkcs5.pbkdf2(password, this.salt, 10, 16); // numIterations set to 10

    // encrypt some bytes using GCM mode
    // (other modes include: CBC, ECB, CFB, OFB, CTR)
    // Note: CBC and ECB modes use PKCS#7 padding as default
    const cipher = forge.cipher.createCipher('AES-GCM', key);
    cipher.start({ iv: this.iv });
    cipher.update(forge.util.createBuffer(data));
    cipher.finish();
    const encrypted = cipher.output;
    this.tag = cipher.mode.tag;
    // outputs encrypted hex
    // console.log(encrypted.toHex());
    return encrypted;
  }

  /**
   * The base decryption method
   * @param {string} password - The password to decrypt
   * @param {ByteStringBuffer} encrypted - the encrypted object
   * @returns {string|boolean} the seed phrases if the password is correct, otherwise false
   */
  decrypt(password, encrypted) {
    const key = forge.pkcs5.pbkdf2(password, this.salt, 10, 16); // numIterations set to 10
    const decipher = forge.cipher.createDecipher('AES-GCM', key);
    decipher.start({ iv: this.iv, tag: this.tag });
    decipher.update(encrypted);
    const pass = decipher.finish();
    // const result = decipher.finish(); // check 'result' for true/false
    // outputs decrypted hex
    // console.log(decipher.output.toHex());
    if (pass) {
      return decipher.output.data;
    }
    console.log('Authentication failed.');
    return false;
  }

  /**
   *
   * @param {string} password - the password
   * @returns {ByteStringBuffer|boolean} the object containing the encrypted string
   * or false if there is no seed
   */
  encryptSeed(password) {
    if (this.getSeed() == null) {
      return false;
    }
    return this.encrypt(this.getSeed(), password);
  }

  /**
   * It must be called after encryptSeed is called at least once
   * @param {string} password - The password to decrypt
   * @param {ByteStringBuffer} - the encrypted object
   * @returns {string|boolean} the seed phrases if the password is correct, otherwise false
   */
  decryptSeed(password, encrypted) {
    return this.decrypt(password, encrypted);
  }

  /**
   * Encrypt the private key of the account, only
   * @param {object} account - The account to encrypt. Only the private key will be encrypted.
   * @param {string} password - The password string used to encrypt the private key
   * @returns {ByteStringBuffer|boolean} - the encrypted private key, or false if failed
   */
  encryptAccount(account, password) {
    const privateKey = account.getPrivateKey();
    return this.encrypt(privateKey, password);
  }

  /**
   * @param {object} cipher - The encrypted object
   * @param {string} password - The password that is used to encrypt the account
   * @returns {string|boolean} the decrypted account private key, or false if failed
   */
  decryptAccount(cipher, password) {
    return this.decrypt(cipher, password);
  }
}

module.exports = WalletManager;
