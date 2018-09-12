/*
The code is refered from the following links
*/
const bip39 = require('bip39')
const hdkey = require('hdkey')
const ethereum_wallet = require('ethereumjs-wallet')
var EthUtil = require('ethereumjs-util');

/** 
 * Returns seed phrases (mnemonic)
 */
function generateSeedPhrases() {
  return bip39.generateMnemonic()
}

/**
 * Return an account generated from the seed phrases
 * @param {string} mnemonic - The string consists of seed phrases, spearated by spaces
 */
function generateWallet(mnemonic) {
  const seed = bip39.mnemonicToSeed(mnemonic); //creates seed buffer
  const root = hdkey.fromMasterSeed(seed);
  const masterPrivateKey = root.privateKey.toString('hex');
  const pkWithHexPrefix = EthUtil.addHexPrefix(masterPrivateKey)
  const privateKeyBuffer = EthUtil.toBuffer(pkWithHexPrefix);
  return ethereum_wallet.fromPrivateKey(privateKeyBuffer)
}

/**
 * Prints the account and its balance.
 * This is to check the existence and balance of an account, not a core functionality. 
 * @param {object} account 
 */
function checkAccountBalance(account) {

}

/**
 * Use AES-CBC to encrypt the rawString with password, and save it.
 * @param {string} password - User's password 
 * @param {string} rawString - The string to be encrypted
 * @param {string} fileName - The name of the file that saves the encrypted string
 */
function encryptAndSave(password, rawString, fileName) {

  }
   
  /**
   * Decrypt and return the original string
   * @param {string} password - User's password
   * @param {string} fileName - The name of the file that saves the encrypted string 
   */
  function decrypt(password, fileName) {

  }

  /**
   * Sign transactions and transact
   * @param {string} from - Private key of the sender 
   * @param {string} to - Public key of the receiver 
   * @param {string} amount - The amount of XLM to send, in string format 
   * @param {string} memo_type - The type of memo 
   * @param {string} memo - the content of memo
   */
  function sendLumens(from, to, amount, memo_type, memo) {

  }

  /**
   * Perform telegated signing
   * @param {string} URI - The input URI, start with web+stellar:
   */
  function parseURIandSendLumen(URI) {
    //parse uri

    //send lumen
    //sendLumens(...)
    return true
  }

// exports the variables and functions above so that other modules can use them
 module.exports.generateSeedPhrases = generateSeedPhrases;  
 module.exports.generateWallet = generateWallet;  
// module.exports.encryptAndSave = encryptAndSave;  
// module.exports.decrypt = decrypt; 
// module.exports.uploadAccountToTestnet = uploadAccountToTestnet; 
// module.exports.checkAccountBalance = checkAccountBalance;
// module.exports.sendLumens = sendLumens;





