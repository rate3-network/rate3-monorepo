const WalletManager = require('./WalletManager');

const password = 'qwerty';
const seedPhrases = 'aspect body artist annual sketch know plug subway series noodle loyal word';

test('createWalletInstance', () => {
  const wallet = new WalletManager('ethereum');
  expect(wallet.getNetwork()).toBe('ethereum');
});

test('changeNetwork', () => {
  const wallet = new WalletManager('ethereum');
  wallet.changeNetwork('stellar');
  expect(wallet.getNetwork()).toBe('stellar');
});

test('setSeedPhrases', () => {
  const wallet = new WalletManager('ethereum');
  wallet.setSeed();
  expect(wallet.getSeed().split(' ').length).toBe(12);// default 12 words

  const numberOfWordsValid = 24;
  wallet.setSeed(numberOfWordsValid);
  expect(wallet.getSeed().split(' ').length).toBe(numberOfWordsValid);

  const numberOfWordsInvalid = 23;
  wallet.setSeed(numberOfWordsInvalid);
  expect(wallet.getSeed()).toBeFalsy();

  const seedPhrasesValid = 'aspect body artist annual sketch know plug subway series noodle loyal word';
  wallet.setSeed(seedPhrasesValid);
  expect(wallet.getSeed()).toBe(seedPhrasesValid);

  const seedPhrasesInvalid = 'aspect body artist annual sketch know plug subway series noodle loyal aspect';
  wallet.setSeed(seedPhrasesInvalid);
  expect(wallet.getSeed()).toBeFalsy();
});

test('setWalletEthereum', () => {
  const wallet = new WalletManager('ethereum');
  wallet.setSeed(seedPhrases);
  wallet.setWallet();
  const expectedPrivateExtendedKey = 'xprv9s21ZrQH143K292aVhhDBd8vpauoKCEM1Rd26jKjs4bq9Juwdug4cSXPgeYdKuVwN4RWQy7HCFundYP5neF4WLjuqDTMW6uvB7SXNWM9mU3';
  const expectedPublicExtendedKey = 'xpub661MyMwAqRbcEd73bjEDYm5fNckHiexCNeYcu7jMRQ8p27F6BSzKAEqsXvXVm2iZodKax66LmfNfr6wJJY6ce54WRgqXGb6hJ6Q9L8uCCJw';
  // extended private key with chain code to derive child keys
  // so that child keys do not rely solely on private key
  const expectedPrivateKey = '0cf027e57e5c53fccaadd016afda565c6cf141412e604988865763e1006d718f';
  const expectedchainCode = '0816b629d6c3891dc6f797e7183c762ceb023328dc30bfaa2bde2fc759b0cad4';
  const expectedPublicKey = '028a0e8fd068c72a209a12d5402e931b3bf4be9d9b3620487698d63dd528b41b8f';
  expect(wallet.getWallet().privateExtendedKey()).toBe(expectedPrivateExtendedKey);
  expect(wallet.getWallet().publicExtendedKey()).toBe(expectedPublicExtendedKey);
  expect(wallet.getWallet()._hdkey._privateKey.toString('hex')).toBe(expectedPrivateKey);
  expect(wallet.getWallet()._hdkey.chainCode.toString('hex')).toBe(expectedchainCode);
  expect(wallet.getWallet()._hdkey._publicKey.toString('hex')).toBe(expectedPublicKey);
  /*
  EthereumHDKey {
  _hdkey:
    HDKey {
      versions: { private: 76066276, public: 76067358 },
      depth: 0,
      index: 0,
      _privateKey: <Buffer 0c f0 27 e5 7e 5c 53 fc ca ad d0 16 af da 56 5c 6c
      f1 41 41 2e 60 49 88 86 57 63 e1 00 6d 71 8f>,
      _publicKey: <Buffer 02 8a 0e 8f d0 68 c7 2a 20 9a 12 d5 40 2e 93 1b 3b
       f4 be 9d 9b 36 20 48 76 98 d6 3d d5 28 b4 1b 8f>,
      chainCode: <Buffer 08 16 b6 29 d6 c3 89 1d c6 f7 97 e7 18 3c 76
       2c eb 02 33 28 dc 30 bf aa 2b de 2f c7 59 b0 ca d4>,
      _fingerprint: 961971491,
      parentFingerprint: 0,
      _identifier: <Buffer 39 56 85 23 8d 11 4f 5d ba 5b ea 69 56 0f 99 46 a5 8d 00 3f> } }
  */
});

test('setWalletStellar', () => {
  const wallet = new WalletManager('stellar');
  wallet.setSeed(seedPhrases);
  wallet.setWallet();
  const seedHex = '00f014c45065a22e90993dec1a6ea5ec0d71aa7b556f72649814a7169861a0d4adc745570dafac9d925df4007d113ad43372886dce61ec62644441b7a072f3e2';
  expect(wallet.getWallet().seedHex).toBe(seedHex);
  /*
      StellarHDWallet {
      seedHex: '00f014c45065a22e90993dec1a6ea5ec0d71aa7b556f72649814a7169861a0d4adc7
      45570dafac9d925df4007d113ad43372886dce61ec62644441b7a072f3e2' }
  */
});

test('setAccountEthereum', async () => {
  const wallet = new WalletManager('ethereum');
  wallet.setSeed(seedPhrases);
  wallet.setWallet();

  let expectedPrivateKey = '0xd74635dc691ec17d2c6dedf412155faec6b628d5cc58fc5fcd44aba74d5fda7f';
  let expectedAddress = '0x8Ff91E4a8313F735D07c1775D4d12ddA1e930D00';
  const expectedBalance = '0';
  let account = await wallet.getAccount();
  expect(account.getAddress()).toBe(expectedAddress);
  expect(account.getPrivateKey()).toBe(expectedPrivateKey);
  expect(account.getBalance()).toBe(expectedBalance);
  /*
    Account {
      network: 'ethereum',
      account:
       { address: '0x8Ff91E4a8313F735D07c1775D4d12ddA1e930D00',
         privateKey: '0xd74635dc691ec17d2c6dedf412155faec6b628d5cc58fc5fcd44aba74d5fda7f',
         signTransaction: [Function: signTransaction],
         sign: [Function: sign],
         encrypt: [Function: encrypt] },
      balance: '0' }
  */
  expectedAddress = '0x2d8Cce8A8B308a077Eb0e39331258c355c55d04e';
  expectedPrivateKey = '0xb1cf5f0991e165de0e832bb3304846f0e902c0fdef39deece4c14f6625dc5a61';
  account = await wallet.getAccount(5);// maximum 2^32 -1, min 0, must be integer
  expect(account.getAddress()).toBe(expectedAddress);
  expect(account.getPrivateKey()).toBe(expectedPrivateKey);
});

test('setAccountStellar', async () => {
  const wallet = new WalletManager('stellar');
  wallet.setSeed(seedPhrases);
  wallet.setWallet();
  let expectedPrivateKey = 'SDJNCBWIH4GU377ICXYL7NEI5Z2GWOR2Y3PAQVI2HJHJ7MSB42PP4KVW';
  let expectedPublicKey = 'GCDAFTYQTU2YVNPCJVIZ6IT2MKSL2KRY724ODR3Y5AJ5NZ2CD6Z7A7GO';
  const expectedBalance = '10000.0000000';
  let account = await wallet.getAccount();

  expect(account.getPrivateKey()).toBe(expectedPrivateKey);
  expect(account.getAddress()).toBe(expectedPublicKey);

  expectedPrivateKey = 'SCHDEOGWKZYYHDTCQFEXMQ3VVDCOZIUBVSJN4DGTOCB5FCCKBYQEG4PA';
  expectedPublicKey = 'GCUTV7FC4GITQI6KJASMKH7WX3NTDLNUBHFZNXVJB4DJGGTUL6I7XAVT';
  account = await wallet.getAccount(10);
  expect(account.getPrivateKey()).toBe(expectedPrivateKey);
  expect(account.getAddress()).toBe(expectedPublicKey);
  expect(account.getBalance()).toBe(expectedBalance);
  /*
      Account {
      network: 'stellar',
      testAddress: 'https://horizon-testnet.stellar.org/accounts/',
      account:
       Keypair {
         type: 'ed25519',
         _secretSeed: <Buffer 8e 32 38 d6 56 71 83 8e 62 81 49 76 43 75 a8 c4 ec a2 81 ac
         92 de 0c d3 70 83 d2 88 4a 0e 20 43>,
         _secretKey: <Buffer 8e 32 38 d6 56 71 83 8e 62 81 49 76 43 75 a8 c4 ec a2 81 ac 92 de 0c
          d3 70 83 d2 88 4a 0e 20 43 a9 3a fc a2 e1 91 38 23 ca48 24 c5 1f f6 be db 31 ad ... >,
         _publicKey: <Buffer a9 3a fc a2 e1 91 38 23 ca 48 24 c5 1f f6 be db 31 ad b4 09 cb
          96 de a9 0f 06 93 1a 74 5f 91 fb> },
      balance: '10000.0000000' }
  */
});

// setting inflation stellar

test('encryptAndDecryptAccountETH', async () => {
  const wallet = new WalletManager('ethereum');
  wallet.setSeed(seedPhrases);
  wallet.setWallet();
  // encrypt hd wallet, use case
  const account = await wallet.getAccount();
  const encrypted = wallet.encrypt(account, password);
  const decryptedAccount = wallet.decrypt(encrypted, password);
  expect(decryptedAccount.getAddress()).toEqual(account.getAddress());
  expect(decryptedAccount.getPrivateKey()).toEqual(account.getPrivateKey());
  expect(decryptedAccount.getNetwork()).toEqual(account.getNetwork());
});

test('encryptAndDecryptAccountStellar', async () => {
  const wallet = new WalletManager('stellar');
  wallet.setSeed(seedPhrases);
  wallet.setWallet();

  const account = await wallet.getAccount();
  const encrypted = wallet.encrypt(account, password);
  const decryptedAccount = wallet.decrypt(encrypted, password);
  expect(decryptedAccount.getAddress()).toEqual(account.getAddress());
  expect(decryptedAccount.getPrivateKey()).toEqual(account.getPrivateKey());
  expect(decryptedAccount.getNetwork()).toEqual(account.getNetwork());
});

test('encryptAndDecryptSeedPhrases', async () => {
  const wallet = new WalletManager('stellar'); // the currency does not matter
  wallet.setSeed(seedPhrases);
  wallet.setWallet();

  const encrypted = wallet.encryptSeed(password);
  const decrypted = wallet.decryptSeed(password, encrypted);
  expect(decrypted).toMatch(seedPhrases); // toBe will fail
});
