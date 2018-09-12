let ethereum_wallet = require('./ethereum_wallet');

const testSeedPhrase = 'rail reward idle hour evil online enforce credit thumb minimum finish leg'
//const testSeedHex = 'e67b04748412748efef0471b7e7c72a645aad84b5f87be771fcbd30a5913b7eccc3d7418a331e54fe2e19c5258fcc751172de8bd2464b3abaf89e36bfbc2f38e'
const testPrivateKey = 'SDSQFGH6U4AMVFNBCDZDOEVLA7CD4U56XQKERSZFLIBYOXZURR4FRGM5'
const testPassword = 'qwerty123456'
const testAddress = '0xc0300eb995c1a9645b7946afb1ac7ceac449ade6'

test('generateSeedPhrases', () => {
  const seedPhrases = ethereum_wallet.generateSeedPhrases()
  expect(seedPhrases.length).toBeGreaterThan(50);
  expect(seedPhrases.length).toBeLessThan(100);
});

test('generateWallet', () => {
  expect(ethereum_wallet.generateWallet(testSeedPhrase).generateAddresses(1)[0]).toBe(testAddress);
});
