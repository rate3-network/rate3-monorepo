let wallet = require('./wallet');

test('generateSeedPhrases', () => {
  expect(wallet.generateSeedPhrases()).not.toBe(3);
});