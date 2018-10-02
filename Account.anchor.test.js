const nock = require('nock');
const WalletManager = require('./WalletManager');

const seedPhrases = 'aspect body artist annual sketch know plug subway series noodle loyal word';
const walletStellar = new WalletManager('stellar');
walletStellar.setSeed(seedPhrases);
walletStellar.setWallet();
let account3Stellar = null;
let account4Stellar = null;

const mockURL = 'http://127.0.0.1:5000'; // Use Python 3 Flask framework to respond
// const expectedPrivateKey3 = 'SCVOAKTGRAR2FOYRPXSSODGW5VDRT3HKTVAYAPU6M7H6XAGNKTWK3VJC';
// const expectedPublicKey3 = 'GCQRO37IHQ2GOQPF7HOFSNK5TNKVQU77WUI2MX3JZ57CCQYSLJMV3NY2';
// const expectedPrivateKey4 = 'SA6XR67FP7ZF4QBOYGPXUBSBQ6275E4HI7AOVSL56JETRBQG2COJCAGP';
// const expectedPublicKey4 = 'GAQNFJEZWLX4MX6YFKQEPAXUH6SJRTTD4EAWGYOA34WNHNPW5EJXU4VV';


beforeAll(async () => {
  // Clears the database and adds some testing data.
  // Jest will wait for this promise to resolve before running tests.
  account4Stellar = await walletStellar.getAccount(4);
  account3Stellar = await walletStellar.getAccount(3);
});

test('anchorDeposit', async () => {
  const couchdb = nock(mockURL)
    .get('/deposit')
    .query({
      asset_code: 'ETH',
      account: 'GACW7NONV43MZIFHCOKCQJAKSJSISSICFVUJ2C6EZIW5773OU3HD64VI',
      // memo_type: '',
      // memo: '',
      // email_address: '',
      // type: '',
    })
    .reply(200, {
      how: '1Nh7uHdvY6fNwtQtM1G5EZAFPLC33B59rB',
      fee_fixed: '0.0002',
    });

  console.log(couchdb, 'couchdb');
  console.log(couchdb.isDone());
  const response = await account3Stellar.getDeposit(mockURL, 'ETH', 'GACW7NONV43MZIFHCOKCQJAKSJSISSICFVUJ2C6EZIW5773OU3HD64VI');
  const expectedResponse = { how: '1Nh7uHdvY6fNwtQtM1G5EZAFPLC33B59rB', fee_fixed: '0.0002' };
  // show the transaction
  expect(response).toEqual(expectedResponse);
});
