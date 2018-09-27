const WalletManager = require('./WalletManager');

const password = 'qwerty';
const seedPhrases = 'aspect body artist annual sketch know plug subway series noodle loyal word';

test('createWalletManagerInstance', () => {
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

test('setWalletETH', () => {
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

test('setAccountETH', async () => {
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

test('sendStellar', async () => {
  jest.setTimeout(30000);// the default timeout is 5000ms

  const wallet = new WalletManager('stellar');
  wallet.setSeed(seedPhrases);
  wallet.setWallet();
  let expectedPrivateKey = 'SCVOAKTGRAR2FOYRPXSSODGW5VDRT3HKTVAYAPU6M7H6XAGNKTWK3VJC';
  let expectedPublicKey = 'GCQRO37IHQ2GOQPF7HOFSNK5TNKVQU77WUI2MX3JZ57CCQYSLJMV3NY2';
  const account3 = await wallet.getAccount(3);
  expect(account3.getPrivateKey()).toBe(expectedPrivateKey);
  expect(account3.getAddress()).toBe(expectedPublicKey);
  expect(parseFloat(account3.getBalance())).toBeGreaterThanOrEqual(0);

  expectedPrivateKey = 'SA6XR67FP7ZF4QBOYGPXUBSBQ6275E4HI7AOVSL56JETRBQG2COJCAGP';
  expectedPublicKey = 'GAQNFJEZWLX4MX6YFKQEPAXUH6SJRTTD4EAWGYOA34WNHNPW5EJXU4VV';
  const account4 = await wallet.getAccount(4);
  expect(account4.getPrivateKey()).toBe(expectedPrivateKey);
  expect(account4.getAddress()).toBe(expectedPublicKey);
  expect(parseFloat(account4.getBalance())).toBeGreaterThanOrEqual(0);
  const result = await account4.send(account3.getAddress(), '10');
  expect(result._links.transaction.href).toMatch(/https:\/\/horizon-testnet.stellar.org\/transactions\//);
  await account3.send(account4.getAddress(), '10');
  // send back, so that the test will not exhaust any account fast
  /* none of the fields are fixed
      { _links:
       { transaction:
          { href: 'https://horizon-testnet.stellar.org/transactions/d47f6d2c888be5fe163fbbd43436d8a6d9d8354c87bb57aa33943ff1dcc0217a' } },
      hash: 'd47f6d2c888be5fe163fbbd43436d8a6d9d8354c87bb57aa33943ff1dcc0217a',
      ledger: 11260923,
      envelope_xdr: 'AAAAACDSpJmy78Zf2CqgR4L0P6SYzmPhAWNhwN8s07X26RN6
      AAAAZACpzY8AAAAwAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAA
      oRdv6Dw0Z0Hl+dxZNV2bVVhT/7URpl9pz34hQxJaWV0AAAAAAAAAAAX14QAAAAAAAAAAA
      fbpE3oAAABAX9N7zS58ZoHYY0GivMUDsx3nFNZA39VJ2V
      +pQszQzjMk06fzEX5NcPx7EHNTH13wN6N/6QJ3OFNFRRw5XdWwCw==',
      result_xdr: 'AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAA=',
      result_meta_xdr: 'AAAAAQAAAAIAAAADAKvT+wAAAAAAAAAAINKkmbLvxl/
      YKqBHgvQ/pJjOY+EBY2HA3yzTtfbpE3oAAAAdOGH0QACpzY8
      AAAAvAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAKvT+
      wAAAAAAAAAAINKkmbLvxl/YKqBHgvQ/pJjOY+EBY2HA3yzTtfbpE3o
      AAAAdOGH0QACpzY8AAAAwAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAABAAAAAMA
      q9P7AAAAAAAAAAAg0qSZsu/GX9gqoEeC9D+kmM5j4QFjYcDfLNO19ukTegAAAB04YfRAAKnNjw
      AAADAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAq9P7AAAAAAAAAAAg0qSZsu/
      GX9gqoEeC9D+kmM5j4QFjYcDfLNO19ukTegAAAB0ybBNAAKnNjwAAADAAAAAAAAAAAAAAAAAAAAAAAQ
      AAAAAAAAAAAAAAAAAAAAAAAAMAq88yAAAAAAAAAAChF2/oPDRnQeX53Fk1XZtVWFP/tRGmX2nPfiFDElpZXQAAAAW0UE/
      sAKnNhwAAAA0AAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAq9P7AAAAAAAAAAChF2/
      oPDRnQeX53Fk1XZtVWFP/tRGmX2nPfiFDElpZXQAAAAW6RjDsAKnNhwAAAA0AAAABAAAAAAAAAAAAAAAAA
      QAAAAAAAAAAAAAAAAAAAA==' }
  */
});

test('sendETH', async () => {
  jest.setTimeout(60000);// the default timeout is 5000ms

  const wallet = new WalletManager('ethereum');
  wallet.setSeed(seedPhrases);
  wallet.setWallet();

  let expectedPrivateKey = '0x10848a86334b428a2f6bdaeaf6dccbe6b3d07ebcc538af29f83a9139ac6c40e8';
  let expectedAddress = '0xfd3B37102b3882E08c8D38fF8BAc1b1b305dc103';
  const account3 = await wallet.getAccount(3);
  expect(account3.getAddress()).toBe(expectedAddress);
  expect(account3.getPrivateKey()).toBe(expectedPrivateKey);

  expectedAddress = '0x7037eAcB1bb6Bf8eE8Cdd1A48f59D3b5BeC63BC2';
  expectedPrivateKey = '0x0442eaba5727f864d62dab0858bd07e6c24484711b215285b108ee6048ba87ea';
  const account4 = await wallet.getAccount(4);
  expect(account4.getAddress()).toBe(expectedAddress);
  expect(account4.getPrivateKey()).toBe(expectedPrivateKey);
  const receipt = await account3.send(expectedAddress, '0.001');
  console.log(receipt)
  expect(receipt.from.toLowerCase()).toBe(account3.getAddress().toLowerCase());
  expect(receipt.status).toBeTruthy();
  expect(receipt.to.toLowerCase()).toBe(account4.getAddress().toLowerCase());
  await account4.send(account3.getAddress(), '0.001');
  /*
    { blockHash: '0x128b031aac89ebe5e543a59ddfe31477927bbacac1cf4093be1e34c467eb0f17',
      blockNumber: 3059634,
      contractAddress: null,
      cumulativeGasUsed: 6746351,
      from: '0xfd3b37102b3882e08c8d38ff8bac1b1b305dc103',
      gasUsed: 21000,
      logs: [],
      logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000
      0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
      0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
      0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
      0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
      00000000000000000000000000000000000000000000000000000000',
      status: true,
      to: '0x7037eacb1bb6bf8ee8cdd1a48f59d3b5bec63bc2',
      transactionHash: '0x2315e9be88d6ca3c0a28b4849d47703cb4bb4fb02907e94051fa98e31a8b2758',
      transactionIndex: 3 }
  */
});

// test('receiveStellar', async () => {
//   jest.setTimeout(30000);// the default timeout is 5000ms

//   const wallet = new WalletManager('stellar');
//   wallet.setSeed(seedPhrases);
//   wallet.setWallet();
//   const account4 = await wallet.getAccount(4);
//   const receiveRecord = await account4.receive();
//   expect(receiveRecord[0].id).toBe('47795285128122369');
// });

// test('receiveEthereum', async () => {
//   jest.setTimeout(30000);// the default timeout is 5000ms

//   const wallet = new WalletManager('ethereum');
//   wallet.setSeed(seedPhrases);
//   wallet.setWallet();
//   const account4 = await wallet.getAccount(4);
//   const receiveRecord = await account4.receive();
//   expect(receiveRecord[0].blockNumber).toBe('3020019');
// });
// // handle eth case
// test('changeTrustStellar', async () => {
//   jest.setTimeout(30000);// the default timeout is 5000ms

//   const wallet = new WalletManager('stellar');
//   wallet.setSeed(seedPhrases);
//   wallet.setWallet();
//   const account8 = await wallet.getAccount(8);// 8\
//   const IssuingAccountAddress = 'GCYEJSMEEP7VQFFS6WELX3QSJRL3OQFIZ4MGXQL6R56P33TKBFBT2GNZ';
//   const response = await account8.changeTrust('FOO', IssuingAccountAddress, '100000');
//   expect(response.result_meta_xdr).toMatch(/e5qCUM9AAAAAAAAAAAAAADo1KUQAAAAAAEAAAAAAAAAAA==/);
// });

// // setting inflation stellar

// test('encryptAndDecryptAccountETH', async () => {
//   const wallet = new WalletManager('ethereum');
//   wallet.setSeed(seedPhrases);
//   wallet.setWallet();
//   // encrypt hd wallet, use case
//   const account = await wallet.getAccount();
//   const encrypted = wallet.encrypt(account, password);
//   const decryptedAccount = wallet.decrypt(encrypted, password);
//   expect(decryptedAccount.getAddress()).toEqual(account.getAddress());
//   expect(decryptedAccount.getPrivateKey()).toEqual(account.getPrivateKey());
//   expect(decryptedAccount.getNetwork()).toEqual(account.getNetwork());
// });

// test('encryptAndDecryptAccountStellar', async () => {
//   const wallet = new WalletManager('stellar');
//   wallet.setSeed(seedPhrases);
//   wallet.setWallet();

//   const account = await wallet.getAccount();
//   const encrypted = wallet.encrypt(account, password);
//   const decryptedAccount = wallet.decrypt(encrypted, password);
//   expect(decryptedAccount.getAddress()).toEqual(account.getAddress());
//   expect(decryptedAccount.getPrivateKey()).toEqual(account.getPrivateKey());
//   expect(decryptedAccount.getNetwork()).toEqual(account.getNetwork());
// });

// // sign data
// // standardize name
// // load this signed
// test('signETH', async () => {
//   const wallet = new WalletManager('ethereum');
//   wallet.setSeed(seedPhrases);
//   wallet.setWallet();

//   const exptectedMesage = 'test';
//   const expectedmesageHash = '0x4a5c5d454721bbbb25540c3317521e71c373ae36458f960d2ad46ef088110e95';
//   const expectedSignature = '0xc381a96085965fa17411546b655332428a63886c912af4b5bf9c215e5d4a96a95e0a2e96a0187e55933b34bec263fc5d77a7c6017b954384bbd23e9ee55ed61a1b';
//   const account = await wallet.getAccount();
//   const signedObject = account.sign(exptectedMesage);
//   expect(signedObject.message).toBe(exptectedMesage);
//   expect(signedObject.messageHash).toBe(expectedmesageHash);
//   expect(signedObject.signature).toBe(expectedSignature);
// });

// test('signStellar', async () => {
//   const wallet = new WalletManager('stellar');
//   wallet.setSeed(seedPhrases);
//   wallet.setWallet();

//   const exptectedMesage = JSON.parse('{"type": "Buffer", "data": [ 45, 213,184,234,218,196,224,146, 52, 91,221, 163,204, 58, 107, 21, 214, 248, 40, 72, 196, 102, 36, 11, 124, 67, 85, 89, 43, 107, 217, 203, 86, 211, 30, 40, 224, 44, 192, 194, 173, 148, 233, 22, 67, 189, 63, 199, 170, 28, 135, 20, 75, 123, 4, 238, 223, 47, 48, 5, 235, 29, 22, 6 ] }');
//   const account = await wallet.getAccount();
//   const signedObject = account.sign('test');
//   expect(signedObject.toJSON().toString()).toBe(exptectedMesage.toString());
// });

// test('delegatedSigningStellar', async () => {
//   const wallet = new WalletManager('stellar');
//   wallet.setSeed(seedPhrases);
//   wallet.setWallet();
//   // build the tx here
//   const account = await wallet.getAccount(3);
//   const sampleXDR = 'web+stellar:tx?xdr=AAAAAKEXb+g8NGdB5fncWTVdm1VYU/+1EaZfac9+IUMSWlldAAAAZACpzYcAAAAKAAAAAAAAAAAAAAABAAAAAQAAAAChF2/oPDRnQeX53Fk1XZtVWFP/tRGmX2nPfiFDElpZXQAAAAEAAAAAINKkmbLvxl/YKqBHgvQ/pJjOY+EBY2HA3yzTtfbpE3oAAAAAAAAAAACYloAAAAAAAAAAAA==';
//   const signedObject = await account.delegatedSigning(sampleXDR);
//   // show the transaction
//   const expectedDestination = 'GAQNFJEZWLX4MX6YFKQEPAXUH6SJRTTD4EAWGYOA34WNHNPW5EJXU4VV';
//   const expectedsignature = '28ed392bd2ebdd7158b69af45ebd4b5f86dbecf39ac96eb512337cb2ca604cbac70e52b2881efe44edc7814d672eed4aa4a64f98f78a8147e5aa8666011d6d0b';
//   expect(signedObject.operations[0].destination).toBe(expectedDestination);
//   // eslint-disable-next-line no-underscore-dangle
//   expect(signedObject.signatures[0]._attributes.signature.toString('hex')).toBe(expectedsignature);
// });

// test('delegatedSigningEth', async () => {
//   const wallet = new WalletManager('ethereum');
//   wallet.setSeed(seedPhrases);
//   wallet.setWallet();

//   const account = await wallet.getAccount(3);
//   const sampleTx = '0x793aa73737a2545cd925f5c0e64529e0f422192e6bbdd53b964989943e6dedda';
//   const signedObject = await account.delegatedSigning(sampleTx);
//   // explain the object
//   const expectedMessageHash = '0xfa401cfe90cfb8d006def59caf30f0ceb9c9cfdbb1d9e85398aa4b0f199dbcde';
//   const expectedRawTransaction = '0xf86b01843b9aca0082520894b929aaf20fd26eb8ed400914e3882e2ee952867088016345785d8a0000802ca072a334620312b2eec41552e781da6ab7247a623b7fa7c240afded7069f71e72aa073846f5e33209dacdfaa1b507fcb537cd69802bd0adba4c60703c4830b9ab2cc';
//   expect(signedObject.messageHash).toBe(expectedMessageHash);
//   expect(signedObject.rawTransaction).toBe(expectedRawTransaction);
// });
// function comments + docs, like that for web3
// api documentation
// readme: summary + ... + link to docs
// Test cases + acceptable comments
// CLI demo in all hands
// encrypted seedphase
// separate that burn fees
