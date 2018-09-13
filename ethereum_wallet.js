/*
The code is refered from the following links
*/
const bip39 = require('bip39')
const hdkey = require('hdkey')
const ethereum_wallet = require('ethereumjs-wallet')
const EthUtil = require('ethereumjs-util');
var Tx = require('ethereumjs-tx');
var Web3 = require('web3');
var web3 = new Web3("https://rinkeby.infura.io/v3/54add33f289d4856968099c7dff630a7");
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

//seedPhrases = generateSeedPhrases()
//my_pk = 'b4c392b3e149e935a44280027e0b4fe8eb3526b3650762f27ae1729fb58bda92'
//wallet = ethereum_wallet.fromPrivateKey(EthUtil.toBuffer(EthUtil.addHexPrefix(my_pk)));
//console.log(wallet.getAddressString())
//console.log(web3_account);
// web3.eth.accounts.signTransaction({
//   from: '0x1d14a9ed46653b2b833f4dac3b6a786c76faedc2',
//   to: '0x2e2a32690B2D09089F62BF3C262edA1aC1118f8F',
//   value: '200000', // in wei
//   gas: 210000
// }, EthUtil.addHexPrefix(my_pk))
// .then(console.log);

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
function encrypt(password, privateKey) {
  return web3.eth.accounts.encrypt(privateKey, password);
}

  /**
   * Decrypt and return the original string
   * @param {string} password - User's password
   * @param {string} fileName - The name of the file that saves the encrypted string 
   */
  function decrypt(password, keystoreJsonV3) {
    return web3.eth.accounts.decrypt(keystoreJsonV3, password);
  }

  /**
   * Sign transactions and transact
   * Using Rinbeky, can change the chianId to use other networks
   * @param {string} from - Private key of the sender 
   * @param {string} to - Public key of the receiver 
   * @param {string} amount - The amount of ether to send, in string format 
   */
  function sendEther(secret, from, to, amount) {
    // infura accepts only raw transactions, because it does not handle private keys
    web3_account = web3.eth.accounts.privateKeyToAccount(secret);
    const rawTransaction = {
      "from": from,//'0x1d14a9ed46653b2b833f4dac3b6a786c76faedc2', from address
      "to": to,//'0x2e2a32690B2D09089F62BF3C262edA1aC1118f8F', to address
      "value": web3.utils.toHex(web3.utils.toWei(amount, "ether")),// e.g. '0.001'
      "gas": 30000,
      "chainId": 4 // https://ethereum.stackexchange.com/questions/17051/how-to-select-a-network-id-or-is-there-a-list-of-network-ids
    
    };
    
    web3_account.signTransaction(rawTransaction)
      .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
      .then(receipt => console.log("Transaction receipt: ", receipt))
      .catch(err => console.error(err));

  }

  // const senderPrivateKey = '0xb4c392b3e149e935a44280027e0b4fe8eb3526b3650762f27ae1729fb58bda92'
  // const senderAddress = '0x1d14a9ed46653b2b833f4dac3b6a786c76faedc2'
  // const receiverAddress = '0x2e2a32690B2D09089F62BF3C262edA1aC1118f8F'
  // const amountOfEtherToSend = '0.001'
  // sendEther(senderPrivateKey,senderAddress,receiverAddress,amountOfEtherToSend)

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
 module.exports.sendEther = sendEther;
 module.exports.encrypt = encrypt;  
 module.exports.decrypt = decrypt; 
// module.exports.uploadAccountToTestnet = uploadAccountToTestnet; 
// module.exports.checkAccountBalance = checkAccountBalance;
// module.exports.sendLumens = sendLumens;





