//import StellarHDWallet from 'stellar-hd-wallet'
var stellarHDWallet = require('stellar-hd-wallet') 
var forge = require('node-forge');
var fs = require('fs');

function generateSeedPhrases() {
    return stellarHDWallet.generateMnemonic();
}

function generateWallet(mnemonic) {
    return stellarHDWallet.fromMnemonic(mnemonic)
}

// openssl enc -des3 -in input.txt -out input.enc
function encryptAndSave(password, rawString, fileName) {
    var input = rawString;

    // AES key and IV sizes
    var keySize = 24;
    var ivSize = 8;
   
    // get derived bytes
    // Notes:
    // 1. If using an alternative hash (eg: "-md sha1") pass
    //   "forge.md.sha1.create()" as the final parameter.
    // 2. If using "-nosalt", set salt to null.
    var salt = forge.random.getBytesSync(8);
    // var md = forge.md.sha1.create(); // "-md sha1"
    var derivedBytes = forge.pbe.opensslDeriveBytes(
      password, salt, keySize + ivSize/*, md*/);
    var buffer = forge.util.createBuffer(derivedBytes);
    var key = buffer.getBytes(keySize);
    var iv = buffer.getBytes(ivSize);
   
    var cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(input, 'binary'));
    cipher.finish();
   
    var output = forge.util.createBuffer();
   
    // if using a salt, prepend this to the output:
    if(salt !== null) {
      output.putBytes('Salted__'); // (add to match openssl tool output)
      output.putBytes(salt);
    }
    output.putBuffer(cipher.output);

    fs.writeFileSync(fileName +'.enc', output.getBytes(), {encoding: 'binary'});
    return true;
  }
   
  // openssl enc -d -des3 -in input.enc -out input.dec.txt
  function decrypt(password, fileName) {
    var input = fs.readFileSync(fileName+'.enc', {encoding: 'binary'});
   
    // parse salt from input
    input = forge.util.createBuffer(input, 'binary');
    // skip "Salted__" (if known to be present)
    input.getBytes('Salted__'.length);
    // read 8-byte salt
    var salt = input.getBytes(8);
   
    // Note: if using "-nosalt", skip above parsing and use
    // var salt = null;
   
    // AES key and IV sizes
    var keySize = 24;
    var ivSize = 8;
   
    var derivedBytes = forge.pbe.opensslDeriveBytes(
      password, salt, keySize + ivSize);
    var buffer = forge.util.createBuffer(derivedBytes);
    var key = buffer.getBytes(keySize);
    var iv = buffer.getBytes(ivSize);
   
    var decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({iv: iv});
    decipher.update(input);
    var result = decipher.finish(); // check 'result' for true/false
   
    return decipher.output;
  }

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

