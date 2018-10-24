const WalletManager = require('./WalletManager');

const seedPhrases = 'aspect body artist annual sketch know plug subway series noodle loyal word';
const walletStellar = new WalletManager('stellar');
walletStellar.setSeed(seedPhrases);
walletStellar.setWallet();
let account3Stellar = null;
let account4Stellar = null;
// const expectedPrivateKey3 = 'SCVOAKTGRAR2FOYRPXSSODGW5VDRT3HKTVAYAPU6M7H6XAGNKTWK3VJC';
// const expectedPublicKey3 = 'GCQRO37IHQ2GOQPF7HOFSNK5TNKVQU77WUI2MX3JZ57CCQYSLJMV3NY2';
// const expectedPrivateKey4 = 'SA6XR67FP7ZF4QBOYGPXUBSBQ6275E4HI7AOVSL56JETRBQG2COJCAGP';
// const expectedPublicKey4 = 'GAQNFJEZWLX4MX6YFKQEPAXUH6SJRTTD4EAWGYOA34WNHNPW5EJXU4VV';

const walletEthereum = new WalletManager('ethereum');
walletEthereum.setSeed(seedPhrases);
walletEthereum.setWallet();
let account3Ethereum = null;
let account4Ethereum = null;

beforeAll(async () => {
  // Clears the database and adds some testing data.
  // Jest will wait for this promise to resolve before running tests.
  account4Stellar = await walletStellar.getAccount(4);
  account3Stellar = await walletStellar.getAccount(3);
  account3Ethereum = await walletEthereum.getAccount(3);
  account4Ethereum = await walletEthereum.getAccount(4);
});

// setting inflation stellar
// // sign data
// // standardize name
// // load this signed
test('signEthereum', async () => {
  jest.setTimeout(30000);
  const exptectedMesage = 'test';
  const expectedmesageHash = '0x4a5c5d454721bbbb25540c3317521e71c373ae36458f960d2ad46ef088110e95';
  const expectedSignature = '0xc381a96085965fa17411546b655332428a63886c912af4b5bf9c215e5d4a96a95e0a2e96a0187e55933b34bec263fc5d77a7c6017b954384bbd23e9ee55ed61a1b';
  const account = await walletEthereum.getAccount();
  const signedObject = account.sign(exptectedMesage);
  expect(signedObject.message).toBe(exptectedMesage);
  expect(signedObject.messageHash).toBe(expectedmesageHash);
  expect(signedObject.signature).toBe(expectedSignature);
  /* signedObject
      { message: 'test',
      messageHash: '0x4a5c5d454721bbbb25540c3317521e71c373ae36458f960d2ad46ef088110e95',
      v: '0x1b',
      r: '0xc381a96085965fa17411546b655332428a63886c912af4b5bf9c215e5d4a96a9',
      s: '0x5e0a2e96a0187e55933b34bec263fc5d77a7c6017b954384bbd23e9ee55ed61a',
      signature: '0xc381a96085965fa17411546b655332428a63886c912af4b5bf9c215e5d4a96a95
      e0a2e96a0187e55933b34bec263fc5d77a7c6017b954384bbd23e9ee55ed61a1b'}
  */
});

test('signStellar', async () => {
  jest.setTimeout(30000);
  const wallet = new WalletManager('stellar');
  wallet.setSeed(seedPhrases);
  wallet.setWallet();
  const exptectedMesage = JSON.parse('{"type": "Buffer", "data": [ 45, 213,184,234,218,196,224,146, 52, 91,221, 163,204, 58, 107, 21, 214, 248, 40, 72, 196, 102, 36, 11, 124, 67, 85, 89, 43, 107, 217, 203, 86, 211, 30, 40, 224, 44, 192, 194, 173, 148, 233, 22, 67, 189, 63, 199, 170, 28, 135, 20, 75, 123, 4, 238, 223, 47, 48, 5, 235, 29, 22, 6 ] }');
  const account = await wallet.getAccount();
  const signedObject = account.sign('test');
  expect(signedObject.toJSON().toString()).toBe(exptectedMesage.toString());
  /* signedObject
      <Buffer 2d d5 b8 ea da c4 e0 92 34 5b dd a3 cc 3a 6b 15 d6 f8 28 48 c4 66 24 0b 7c 43 55 59 2b
       6b d9 cb 56 d3 1e 28 e0 2c c0 c2 ad 94 e9 16 43 bd 3f
      c7 aa 1c ... >
  */
});

test('delegatedSigningStellar', async () => {
  jest.setTimeout(30000);
  const sampleXDR = 'web+stellar:tx?xdr=AAAAAKEXb+g8NGdB5fncWTVdm1VYU/+1EaZfac9+IUMSWlldAAAAZACpzYcAAAAKAAAAAAAAAAAAAAABAAAAAQAAAAChF2/oPDRnQeX53Fk1XZtVWFP/tRGmX2nPfiFDElpZXQAAAAEAAAAAINKkmbLvxl/YKqBHgvQ/pJjOY+EBY2HA3yzTtfbpE3oAAAAAAAAAAACYloAAAAAAAAAAAA==';
  const signedObject = await account3Stellar.delegatedSigning(sampleXDR);
  // show the transaction
  const expectedDestination = 'GAQNFJEZWLX4MX6YFKQEPAXUH6SJRTTD4EAWGYOA34WNHNPW5EJXU4VV';
  const expectedsignature = '28ed392bd2ebdd7158b69af45ebd4b5f86dbecf39ac96eb512337cb2ca604cbac70e52b2881efe44edc7814d672eed4aa4a64f98f78a8147e5aa8666011d6d0b';
  expect(signedObject.operations[0].destination).toBe(expectedDestination);
  // eslint-disable-next-line no-underscore-dangle
  expect(signedObject.signatures[0]._attributes.signature.toString('hex')).toBe(expectedsignature);
  /* Signed transaction
      Transaction {
      tx:
       ChildStruct {
         _attributes:
          { sourceAccount: [ChildUnion],
            fee: 100,
            seqNum: [Hyper],
            timeBounds: undefined,
            memo: [ChildUnion],
            operations: [Array],
            ext: [ChildUnion] } },
      source: 'GCQRO37IHQ2GOQPF7HOFSNK5TNKVQU77WUI2MX3JZ57CCQYSLJMV3NY2',
      fee: 100,
      _memo:
       ChildUnion {
         _switch: ChildEnum { name: 'memoNone', value: 0 },
         _arm:
          { read: [Function: read],
            write: [Function: write],
            isValid: [Function: isValid],
            toXDR: [Function: toXDR],
            fromXDR: [Function: fromXDR] },
         _armType:
          { read: [Function: read],
            write: [Function: write],
            isValid: [Function: isValid],
            toXDR: [Function: toXDR],
            fromXDR: [Function: fromXDR] },
         _value: undefined },
      sequence: '47795250768379914',
      operations:
       [ { source: 'GCQRO37IHQ2GOQPF7HOFSNK5TNKVQU77WUI2MX3JZ57CCQYSLJMV3NY2',
           type: 'payment',
           destination: 'GAQNFJEZWLX4MX6YFKQEPAXUH6SJRTTD4EAWGYOA34WNHNPW5EJXU4VV',
           asset: [Asset],
           amount: '1' } ],
      signatures: [ ChildStruct { _attributes: [Object] } ] }
  */
});

test('delegatedSigningEthereum', async () => {
  jest.setTimeout(30000);
  const sampleTx = '0x793aa73737a2545cd925f5c0e64529e0f422192e6bbdd53b964989943e6dedda';
  const signedObject = await account3Ethereum.delegatedSigning(sampleTx);
  // explain the object
  const expectedMessageHash = '0xfa401cfe90cfb8d006def59caf30f0ceb9c9cfdbb1d9e85398aa4b0f199dbcde';
  const expectedRawTransaction = '0xf86b01843b9aca0082520894b929aaf20fd26eb8ed400914e3882e2ee952867088016345785d8a0000802ca072a334620312b2eec41552e781da6ab7247a623b7fa7c240afded7069f71e72aa073846f5e33209dacdfaa1b507fcb537cd69802bd0adba4c60703c4830b9ab2cc';
  expect(signedObject.messageHash).toBe(expectedMessageHash);
  expect(signedObject.rawTransaction).toBe(expectedRawTransaction);
  /*
      { messageHash: '0xfa401cfe90cfb8d006def59caf30f0ceb9c9cfdbb1d9e85398aa4b0f199dbcde',
      v: '0x2c',
      r: '0x72a334620312b2eec41552e781da6ab7247a623b7fa7c240afded7069f71e72a',
      s: '0x73846f5e33209dacdfaa1b507fcb537cd69802bd0adba4c60703c4830b9ab2cc',
      rawTransaction: '0xf86b01843b9aca0082520894b929aaf20fd26eb8ed400914e3882e2ee952867088016345785
      d8a0000802ca072a334620312b2eec41552e781da6ab7247a623b7fa7c240afded7069f71e72aa073846f5e33209da
      cdfaa1b507fcb537cd69802bd0adba4c60703c4830b9ab2cc' }
  */
});
// function comments + docs, like that for web3
// api documentation
// readme: summary + ... + link to docs
// Test cases + acceptable comments
// CLI demo in all hands
// separate that burn fees
