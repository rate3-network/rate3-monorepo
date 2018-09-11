/*
The code is refered from the following links
https://www.npmjs.com/package/stellar-hd-wallet
https://www.npmjs.com/package/node-forge
*/

const stellarHDWallet = require('stellar-hd-wallet') 
const forge = require('node-forge');
const fs = require('fs');

/** Returns seed phrases (mnemonic)
 */
function generateSeedPhrases() {
    return stellarHDWallet.generateMnemonic();
}

/**
 * Return an account generated from the seed phrases
 * @param {string} mnemonic - The string consists of seed phrases, spearated by spaces
 */
function generateWallet(mnemonic) {
    return stellarHDWallet.fromMnemonic(mnemonic)
}

/**
 * Use AES-CBC to encrypt the rawString with password, and save it.
 * @param {string} password - User's password 
 * @param {string} rawString - The string to be encrypted
 * @param {string} fileName - The name of the file that saves the encrypted string
 */
function encryptAndSave(password, rawString, fileName) {
    // AES key and IV sizes
    const keySize = 24;
    const ivSize = 8;
   
    // get derived bytes
    const salt = forge.random.getBytesSync(8);
    const derivedBytes = forge.pbe.opensslDeriveBytes(
      password, salt, keySize + ivSize/*, md*/);
    const buffer = forge.util.createBuffer(derivedBytes);
    const key = buffer.getBytes(keySize);
    const iv = buffer.getBytes(ivSize);
   
    let cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(rawString, 'binary'));
    cipher.finish();
   
    let output = forge.util.createBuffer();
   
    // if using a salt, prepend this to the output:
    if(salt !== null) {
      output.putBytes('Salted__'); // (add to match openssl tool output)
      output.putBytes(salt);
    }
    output.putBuffer(cipher.output);

    fs.writeFileSync(fileName +'.enc', output.getBytes(), {encoding: 'binary'});
    return true;
  }
   
  /**
   * Decrypt and return the original string
   * @param {string} password - User's password
   * @param {string} fileName - The name of the file that saves the encrypted string 
   */
  function decrypt(password, fileName) {
    let input = fs.readFileSync(fileName+'.enc', {encoding: 'binary'});
   
    // parse salt from input
    input = forge.util.createBuffer(input, 'binary');
    // skip "Salted__" (if known to be present)
    input.getBytes('Salted__'.length);
    // read 8-byte salt
    const salt = input.getBytes(8);
   
    // AES key and IV sizes
    const keySize = 24;
    const ivSize = 8;
   
    const derivedBytes = forge.pbe.opensslDeriveBytes(
      password, salt, keySize + ivSize);
    const buffer = forge.util.createBuffer(derivedBytes);
    const key = buffer.getBytes(keySize);
    const iv = buffer.getBytes(ivSize);
   
    let decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({iv: iv});
    decipher.update(input);
    const result = decipher.finish(); // check 'result' for true/false
   
    return decipher.output;
  }

// exports the variables and functions above so that other modules can use them
module.exports.generateSeedPhrases = generateSeedPhrases;  
module.exports.generateWallet = generateWallet;  
module.exports.encryptAndSave = encryptAndSave;  
module.exports.decrypt = decrypt;  

/*
// sample usage
password = 'qwerty';
seedPhrases = generateSeedPhrases();
wallet = generateWallet(seedPhrases);
encryptAndSave(password, wallet.getSecret(0), 'privateKey');
encryptAndSave(password, seedPhrases, 'mnemonic');
decryptedPrivateKey = decrypt(password, 'privateKey');
decryptedMnemonic = decrypt(password, 'mnemonic');

console.log('seedPhrases:')
console.log(seedPhrases)
console.log('seedPhrases decrypted:')
console.log(decryptedMnemonic.data)

console.log('PrivateKey:')
console.log(wallet.getSecret(0))
console.log('PrivateKey decrypted:')
console.log(decryptedPrivateKey.data)
console.log('Generate wallet from seedPhrases:')
console.log(generateWallet(decryptedMnemonic.data).getSecret(0))
*/


