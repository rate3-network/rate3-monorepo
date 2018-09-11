let wallet = require('./wallet');

const testSeedPhrase = 'leave slush find believe wild shaft consider bridge route judge bag gain title uncle ski wool fiber viable tobacco addict forest work deposit saddle'
const testSeedHex = 'e67b04748412748efef0471b7e7c72a645aad84b5f87be771fcbd30a5913b7eccc3d7418a331e54fe2e19c5258fcc751172de8bd2464b3abaf89e36bfbc2f38e'
const testPrivateKey = 'SDSQFGH6U4AMVFNBCDZDOEVLA7CD4U56XQKERSZFLIBYOXZURR4FRGM5'
const testPassword = 'qwerty123456'

test('generateSeedPhrases', () => {
  const seedPhrases = wallet.generateSeedPhrases()
  expect(seedPhrases).not.toBe(3);
});

test('generateWallet', () => {
  expect(wallet.generateWallet(testSeedPhrase).seedHex).toBe(testSeedHex);
});

test('encryptAndDecryptMnemonic', () => {
  wallet.encryptAndSave(testPassword, testSeedPhrase, 'mnemonic');
  let decryptedMnemonic = wallet.decrypt(testPassword, 'mnemonic');
  expect(decryptedMnemonic.data).toBe(testSeedPhrase);
});

test('encryptAndDecryptprivateKey', () => {
  wallet.encryptAndSave(testPassword, testPrivateKey, 'privateKey');
  let decryptedPrivateKey = wallet.decrypt(testPassword, 'privateKey');
  expect(decryptedPrivateKey.data).toBe(testPrivateKey);
});