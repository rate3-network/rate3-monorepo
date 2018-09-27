const StellarSdk = require('stellar-sdk');
const WalletManager = require('./WalletManager');

const password = 'qwerty';
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

test('sendStellar', async () => {
  jest.setTimeout(30000);// the default timeout is 5000ms
  expect(parseFloat(account3Stellar.getBalance())).toBeGreaterThanOrEqual(0);
  expect(parseFloat(account4Stellar.getBalance())).toBeGreaterThanOrEqual(0);
  const result = await account4Stellar.send(account3Stellar.getAddress(), '10');
  expect(result._links.transaction.href).toMatch(/https:\/\/horizon-testnet.stellar.org\/transactions\//);
  await account3Stellar.send(account4Stellar.getAddress(), '10');
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

test('sendEthereum', async () => {
  jest.setTimeout(60000);// the default timeout is 5000ms
  const receipt = await account3Ethereum.send(account4Ethereum.getAddress(), '0.001');
  expect(receipt.from.toLowerCase()).toBe(account3Ethereum.getAddress().toLowerCase());
  expect(receipt.status).toBeTruthy();
  expect(receipt.to.toLowerCase()).toBe(account4Ethereum.getAddress().toLowerCase());
  await account4Ethereum.send(account3Ethereum.getAddress(), '0.001');
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

test('receiveStellar', async () => {
  jest.setTimeout(60000);// the default timeout is 5000ms
  const receiveRecord = await account4Stellar.receive();
  // verify the 0th transaction received, the rest are similar
  const expectedID = '47795285128122369';
  const expectedPagingToken = '47795285128122369';
  const expectedSourceAccount = 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR';
  const expectedType = 'create_account';
  const expectedCreatedAt = '2018-09-19T05:45:19Z';
  const expectedTransactionHash = '4df419c828e4493b7a73f6c74a501d553e1d264422712a59334b2180dad53c17';
  const expectedStartingBalance = '10000.0000000';
  const expectedFunder = 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR';
  const expectedAccount = 'GAQNFJEZWLX4MX6YFKQEPAXUH6SJRTTD4EAWGYOA34WNHNPW5EJXU4VV';
  expect(receiveRecord[0].id).toBe(expectedID);
  expect(receiveRecord[0].paging_token).toBe(expectedPagingToken);
  expect(receiveRecord[0].source_account).toBe(expectedSourceAccount);
  expect(receiveRecord[0].type).toBe(expectedType);
  expect(receiveRecord[0].created_at).toBe(expectedCreatedAt);
  expect(receiveRecord[0].transaction_hash).toBe(expectedTransactionHash);
  expect(receiveRecord[0].starting_balance).toBe(expectedStartingBalance);
  expect(receiveRecord[0].funder).toBe(expectedFunder);
  expect(receiveRecord[0].account).toBe(expectedAccount);
  /*
      [ { _links:
         { self: [Object],
           transaction: [Object],
           effects: [Object],
           succeeds: [Object],
           precedes: [Object] },
        id: '47795285128122369',
        paging_token: '47795285128122369',
        source_account: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
        type: 'create_account',
        type_i: 0,
        created_at: '2018-09-19T05:45:19Z',
        transaction_hash: '4df419c828e4493b7a73f6c74a501d553e1d264422712a59334b2180dad53c17',
        starting_balance: '10000.0000000',
        funder: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
        account: 'GAQNFJEZWLX4MX6YFKQEPAXUH6SJRTTD4EAWGYOA34WNHNPW5EJXU4VV' },
        ...]
  */
});

test('receiveEthereum', async () => {
  jest.setTimeout(60000);// the default timeout is 5000ms
  const receiveRecord = await account4Ethereum.receive();
  // verify the 0th transaction received, the rest are similar
  const expectedBlockNumber = '3020019';
  const expectedTimeStamp = '1537427071';
  const expectedhash = '0xfb37067138a34b374085331b9131db11bc4aae6b03a4b50686784dae2249b342';
  const expectedNonce = '0';
  const expectedBlockHash = '0xcce9752745c2c64b088e0740bed09848af8d6a7e283d5514c2f5b5134f0b1c7d';
  const expectedtransactionIndex = '12';
  const expectedFrom = '0xfd3b37102b3882e08c8d38ff8bac1b1b305dc103';
  const expectedTo = '0x7037eacb1bb6bf8ee8cdd1a48f59d3b5bec63bc2';
  const expectedValue = '10000000000000000';
  const expectedGas = '30000';
  const expectedGasPrice = '1000000000';
  const expectedIsError = '0';
  const expectedTxReceiptStatus = '1';
  const expectedInput = '0x';
  const expectedGasUsed = '21000';
  expect(receiveRecord[0].blockNumber).toBe(expectedBlockNumber);
  expect(receiveRecord[0].timeStamp).toBe(expectedTimeStamp);
  expect(receiveRecord[0].hash).toBe(expectedhash);
  expect(receiveRecord[0].nonce).toBe(expectedNonce);
  expect(receiveRecord[0].blockHash).toBe(expectedBlockHash);
  expect(receiveRecord[0].transactionIndex).toBe(expectedtransactionIndex);
  expect(receiveRecord[0].from).toBe(expectedFrom);
  expect(receiveRecord[0].to).toBe(expectedTo);
  expect(receiveRecord[0].value).toBe(expectedValue);
  expect(receiveRecord[0].gas).toBe(expectedGas);
  expect(receiveRecord[0].gasPrice).toBe(expectedGasPrice);
  expect(receiveRecord[0].isError).toBe(expectedIsError);
  expect(receiveRecord[0].txreceipt_status).toBe(expectedTxReceiptStatus);
  expect(receiveRecord[0].input).toBe(expectedInput);
  expect(receiveRecord[0].gasUsed).toBe(expectedGasUsed);
  /*
      [ { blockNumber: '3020019',
        timeStamp: '1537427071',
        hash: '0xfb37067138a34b374085331b9131db11bc4aae6b03a4b50686784dae2249b342',
        nonce: '0',
        blockHash: '0xcce9752745c2c64b088e0740bed09848af8d6a7e283d5514c2f5b5134f0b1c7d',
        transactionIndex: '12',
        from: '0xfd3b37102b3882e08c8d38ff8bac1b1b305dc103',
        to: '0x7037eacb1bb6bf8ee8cdd1a48f59d3b5bec63bc2',
        value: '10000000000000000',
        gas: '30000',
        gasPrice: '1000000000',
        isError: '0',
        txreceipt_status: '1',
        input: '0x',
        contractAddress: '',
        cumulativeGasUsed: '2455231',
        gasUsed: '21000',
        confirmations: '40261' },
        ...
  */
});

test('changeTrustStellar', async () => {
  jest.setTimeout(60000);// the default timeout is 5000ms

  const account8 = await walletStellar.getAccount(8);
  // GAMNOS6T7BSMIMQSJ3SDTWA52TRER6O5RN46D6IXPZPQGLVCDKSOX7MN
  const IssuingAccountAddress = 'GCYEJSMEEP7VQFFS6WELX3QSJRL3OQFIZ4MGXQL6R56P33TKBFBT2GNZ';
  const assetCode = 'FOO';
  const limit = '100000';
  const response = await account8.changeTrust(assetCode, IssuingAccountAddress, limit);
  const tx = new StellarSdk.Transaction(response.envelope_xdr);
  const expectedSource = account8.getAddress();
  const expectedFee = 100;
  const expectedOperationType = 'changeTrust';
  expect(tx.source).toBe(expectedSource);
  expect(tx.fee).toBe(expectedFee);
  expect(tx.operations[0].type).toBe(expectedOperationType);
  expect(tx.operations[0].line.issuer).toBe(IssuingAccountAddress);
  expect(tx.operations[0].line.code).toBe(assetCode);
  expect(tx.operations[0].limit).toBe(limit);
  expect(response.result_meta_xdr).toMatch(/e5qCUM9AAAAAAAAAAAAAADo1KUQAAAAAAEAAAAAAAAAAA==/);
  /* All the fields change in the response
      { _links:
       { transaction:
          { href: 'https://horizon-testnet.stellar.org/transactions/cf03553e61916a7f056b0cb3033769076ef05c7ed076d22e52beb4d312fbd955' } },
      hash: 'cf03553e61916a7f056b0cb3033769076ef05c7ed076d22e52beb4d312fbd955',
      ledger: 11263226,
      envelope_xdr: 'AAAAABjXS9P4ZMQyEk7kOdgd1OJI+d2LeeH5F35fAy6iGqTrAAAAZACp0eIAAAAt
      AAAAAAAAAAAAAAABAAAAAAAAAAYAAAABRk9PAAAAAACwRMmEI/9YFLL1iLvuEkxXt0CozxhrwX6PfP3uaglDPQ
      AAAOjUpRAAAAAAAAAAAAGiGqTrAAAAQPUnM/pZaijsIh13BJmAXTs7FbHV9AzprniGyRBUFgCDntHX1QpZhl
      AN8F5rxyrFrnJUOpWFn0SwyRHAslx0XgY=',
      result_xdr: 'AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAAGAAAAAAAAAAA=',
      result_meta_xdr: 'AAAAAQAAAAIAAAADAKvc+gAAAAAAAAAAGNdL0/hkxDISTuQ52B3U4kj53Yt54fkXfl8DLqIapOs
      AAAAXSHbWbACp0eIAAAAsAAAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAKvc+gAAAAAAAAAAGNdL0
      /hkxDISTuQ52B3U4kj53Yt54fkXfl8DLqIapOsAAAAXSHbWbACp0eIAAAAtAAAAAQAAAAAAAAAAAAAAAAE
      AAAAAAAAAAAAAAAAAAAAAAAABAAAAAgAAAAMAq9zsAAAAAQAAAAAY10vT
      +GTEMhJO5DnYHdTiSPndi3nh+Rd+XwMuohqk6w
      AAAAFGT08AAAAAALBEyYQj/1gUsvWIu+4STFe3QKjPGGvBfo98/e5qCUM9AAAAAAAAAAAAAADo1KUQAAAAAAE
      AAAAAAAAAAAAAAAEAq9z6AAAAAQAAAAAY10vT+GTEMhJO5DnYHdTiSPndi3nh+Rd+XwMuohqk6wAAAAFGT08AAAAAA
      LBEyYQj/1gUsvWIu+4STFe3QKjPGGvBfo98/e5qCUM9AAAAAAAAAAAAAADo1KUQAAAAAAEAAAAAAAAAAA==' }
  */
  // The transaction contstructed from envelope_dxr in the response
  /*
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
      source: 'GAMNOS6T7BSMIMQSJ3SDTWA52TRER6O5RN46D6IXPZPQGLVCDKSOX7MN',
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
      sequence: '47800039656915022',
      operations: [ { type: 'changeTrust', line: [Asset], limit: '100000' } ],
      signatures: [ ChildStruct { _attributes: [Object] } ] }
 */
});

test('changeTrustEthereum', async () => {
  jest.setTimeout(60000);// the default timeout is 5000ms

  const wallet = new WalletManager('ethereum');
  wallet.setSeed(seedPhrases);
  wallet.setWallet();
  const account8 = await wallet.getAccount(8);
  expect(await account8.changeTrust('anyAssetName', 'AnyIssuingAddress', 'AnyLimit')).toBeNull();
  // There is no such operation for Ethereum.
});

// setting inflation stellar

// // sign data
// // standardize name
// // load this signed