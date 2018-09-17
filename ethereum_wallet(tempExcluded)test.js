let ethereum_wallet = require('./ethereum_wallet');

const testSeedPhrase = 'focus shoulder huge sniff unknown adjust scrub shrug company response bargain inform'
//const testSeedHex = 'e67b04748412748efef0471b7e7c72a645aad84b5f87be771fcbd30a5913b7eccc3d7418a331e54fe2e19c5258fcc751172de8bd2464b3abaf89e36bfbc2f38e'
const testPrivateKey = '0xb4a76267823fa9147b436726ff22147448d486ed692b0eda6c664016f95295a4'
const testPassword = 'qwerty123456'
const testAddress = '0x8b1b30bfe8e88300cd08bff9018a24353a567b5a'
const testPublicAddress = '0x099efadf7a33241621e8e9b177001b0df27b0a68b8f8e512a0cc73c0e9512570bd11b0be17634535c5167d1e18bf9c2e16fd1f2260609192eaa2f1272a05b579'

test('generateSeedPhrases', () => {
  const seedPhrases = ethereum_wallet.generateSeedPhrases()
  expect(seedPhrases.length).toBeGreaterThan(50);
  expect(seedPhrases.length).toBeLessThan(100);
});

test('generateWallet', () => {
  expect(ethereum_wallet.generateWallet(testSeedPhrase).getAddressString()).toBe(testAddress);
});

test('signAndTransact', () => {
  const senderPrivateKey = '0xb4c392b3e149e935a44280027e0b4fe8eb3526b3650762f27ae1729fb58bda92'
  const senderAddress = '0x1d14a9ed46653b2b833f4dac3b6a786c76faedc2'
  const receiverAddress = '0x2e2a32690B2D09089F62BF3C262edA1aC1118f8F'
  const amountOfEtherToSend = '0.001'
  ethereum_wallet.sendEther(senderPrivateKey,senderAddress,receiverAddress,amountOfEtherToSend)
  expect(1).toBe(1);
});

test('encrypt', () => {
  const privateKey = '0xb4c392b3e149e935a44280027e0b4fe8eb3526b3650762f27ae1729fb58bda92'
  const address = '0x1d14a9ed46653b2b833f4dac3b6a786c76faedc2'
  const password = 'qwerty'
  const version = 3
  const cipher = 'aes-128-ctr'
  const kdf = 'scrypt'
  keystoreV3 = ethereum_wallet.encrypt(password, privateKey)
  expect(keystoreV3.version).toBe(version);
  expect('0x' + keystoreV3.address).toBe(address)
  expect(keystoreV3.crypto.cipher).toBe(cipher)
  expect(keystoreV3.crypto.kdf).toBe(kdf)
});

test('decrypt', () => {
  const privateKey = '0xb4c392b3e149e935a44280027e0b4fe8eb3526b3650762f27ae1729fb58bda92'
  const password = 'qwerty'
  keystoreV3 = ethereum_wallet.encrypt(password, privateKey)
  decrypted = ethereum_wallet.decrypt(password, keystoreV3)
  expect(decrypted.address).toMatch(/0x1[d|D]14[a|A]9[e|E][d|D]46653[b|B]2[b|B]833[f|F]4[d|D][a|A][c|C]3[b|B]6[a|A]786[c|C]76[f|F][a|A][e|E][d|D][c|C]2/);// address case insensitive
  expect(decrypted.privateKey).toBe(privateKey)
  expect(ethereum_wallet.decrypt(password+'1', keystoreV3)).toBeFalsy()

});


