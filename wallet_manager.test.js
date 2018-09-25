const wallet_manager_module = require('./wallet_manager')
const seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
const Web3 = require('web3');
const web3 = new Web3("https://rinkeby.infura.io/v3/54add33f289d4856968099c7dff630a7");

let password = 'qwerty'

test('createWalletManagerInstance', () => {
    const wallet_manager = new wallet_manager_module('ethereum')
    expect(wallet_manager.getNetwork()).toBe('ethereum');
  });

test('changeNetwork', () => {
    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.changeNetwork('stellar')
    expect(wallet_manager.getNetwork()).toBe('stellar');
  });  

test('setSeedPhrases', () => {
    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed()
    expect(wallet_manager.getSeed().split(' ').length).toBe(12);// default 12 words

    let number_of_words_valid = 24
    wallet_manager.setSeed(number_of_words_valid)
    expect(wallet_manager.getSeed().split(' ').length).toBe(number_of_words_valid);

    let number_of_words_invalid = 23
    wallet_manager.setSeed(number_of_words_invalid)
    expect(wallet_manager.getSeed()).toBeFalsy();

    let seed_phrases_valid = 'aspect body artist annual sketch know plug subway series noodle loyal word'
    wallet_manager.setSeed(seed_phrases_valid)
    expect(wallet_manager.getSeed()).toBe(seed_phrases_valid);

    let seed_phrases_invalid = 'aspect body artist annual sketch know plug subway series noodle loyal aspect'
    wallet_manager.setSeed(seed_phrases_invalid)
    expect(wallet_manager.getSeed()).toBeFalsy();

  });  

test('setWalletETH', () => {
    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()
    let privateExtendedKey = 'xprv9s21ZrQH143K292aVhhDBd8vpauoKCEM1Rd26jKjs4bq9Juwdug4cSXPgeYdKuVwN4RWQy7HCFundYP5neF4WLjuqDTMW6uvB7SXNWM9mU3'
    expect(wallet_manager.getWallet().privateExtendedKey()).toBe(privateExtendedKey);
  });   

test('setWalletStellar', () => {
    const wallet_manager = new wallet_manager_module('stellar')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()
    let seedHex = '00f014c45065a22e90993dec1a6ea5ec0d71aa7b556f72649814a7169861a0d4adc745570dafac9d925df4007d113ad43372886dce61ec62644441b7a072f3e2'
    expect(wallet_manager.getWallet().seedHex).toBe(seedHex);
  }); 

test('setAccountETH', async () => {
    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()

    let expectedPrivateKey = '0xd74635dc691ec17d2c6dedf412155faec6b628d5cc58fc5fcd44aba74d5fda7f'
    let expectedAddress = '0x8Ff91E4a8313F735D07c1775D4d12ddA1e930D00'
    let expectedBalance = '0'
    let account = await wallet_manager.getAccount()
    expect(account.getAddress()).toBe(expectedAddress);
    expect(account.getPrivateKey()).toBe(expectedPrivateKey)
    expect(account.getBalance()).toBe(expectedBalance)
 

    expectedAddress = '0x2d8Cce8A8B308a077Eb0e39331258c355c55d04e'
    expectedPrivateKey = '0xb1cf5f0991e165de0e832bb3304846f0e902c0fdef39deece4c14f6625dc5a61'
    account = await wallet_manager.getAccount(5)
    expect(account.getAddress()).toBe(expectedAddress);
    expect(account.getPrivateKey()).toBe(expectedPrivateKey)
  });  

test('setAccountStellar', async () => {
    const wallet_manager = new wallet_manager_module('stellar')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()
    let expectedPrivateKey = 'SDJNCBWIH4GU377ICXYL7NEI5Z2GWOR2Y3PAQVI2HJHJ7MSB42PP4KVW'
    let expectedPublicKey = 'GCDAFTYQTU2YVNPCJVIZ6IT2MKSL2KRY724ODR3Y5AJ5NZ2CD6Z7A7GO'
    let expectedBalance = '10000.0000000'
    let account = await wallet_manager.getAccount()

    expect(account.getPrivateKey()).toBe(expectedPrivateKey);
    expect(account.getAddress()).toBe(expectedPublicKey);
    expect(account.getBalance()).toBe('15000.0000000');

    expectedPrivateKey = 'SCHDEOGWKZYYHDTCQFEXMQ3VVDCOZIUBVSJN4DGTOCB5FCCKBYQEG4PA'
    expectedPublicKey = 'GCUTV7FC4GITQI6KJASMKH7WX3NTDLNUBHFZNXVJB4DJGGTUL6I7XAVT'
    account = await wallet_manager.getAccount(10)
    expect(account.getPrivateKey()).toBe(expectedPrivateKey);
    expect(account.getAddress()).toBe(expectedPublicKey);
    expect(account.getBalance()).toBe(expectedBalance);
  });  

  test('sendStellar', async () => {
    jest.setTimeout(30000);// the default timeout is 5000ms

    const wallet_manager = new wallet_manager_module('stellar')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()
    let expectedPrivateKey = 'SCVOAKTGRAR2FOYRPXSSODGW5VDRT3HKTVAYAPU6M7H6XAGNKTWK3VJC'
    let expectedPublicKey = 'GCQRO37IHQ2GOQPF7HOFSNK5TNKVQU77WUI2MX3JZ57CCQYSLJMV3NY2'
    let account3 = await wallet_manager.getAccount(3)
    expect(account3.getPrivateKey()).toBe(expectedPrivateKey);
    expect(account3.getAddress()).toBe(expectedPublicKey);
    //expect(account.getBalance()).toBe("0.0000000");

    expectedPrivateKey = 'SA6XR67FP7ZF4QBOYGPXUBSBQ6275E4HI7AOVSL56JETRBQG2COJCAGP'
    expectedPublicKey = 'GAQNFJEZWLX4MX6YFKQEPAXUH6SJRTTD4EAWGYOA34WNHNPW5EJXU4VV'
    let account4 = await wallet_manager.getAccount(4)
    expect(account4.getPrivateKey()).toBe(expectedPrivateKey);
    expect(account4.getAddress()).toBe(expectedPublicKey);
    //expect(account.getBalance()).toBe(expectedBalance);
    let result = await account4.send(account3.getAddress(), '10')
    expect(result._links.transaction.href).toMatch(/https:\/\/horizon-testnet.stellar.org\/transactions\//)
  });  

  test('sendETH', async () => {
    jest.setTimeout(30000);// the default timeout is 5000ms

    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()

    let expectedPrivateKey = '0x10848a86334b428a2f6bdaeaf6dccbe6b3d07ebcc538af29f83a9139ac6c40e8'
    let expectedAddress = '0xfd3B37102b3882E08c8D38fF8BAc1b1b305dc103'
    let expectedBalance = '0'
    let account3 = await wallet_manager.getAccount(3)
    expect(account3.getAddress()).toBe(expectedAddress);
    expect(account3.getPrivateKey()).toBe(expectedPrivateKey)

    expectedAddress = '0x7037eAcB1bb6Bf8eE8Cdd1A48f59D3b5BeC63BC2'
    expectedPrivateKey = '0x0442eaba5727f864d62dab0858bd07e6c24484711b215285b108ee6048ba87ea'
    let account4 = await wallet_manager.getAccount(4)
    expect(account4.getAddress()).toBe(expectedAddress);
    expect(account4.getPrivateKey()).toBe(expectedPrivateKey)
    let receipt = await account3.send(expectedAddress, '0.001')
    expect(receipt.from.toLowerCase()).toBe(account3.getAddress().toLowerCase())
    expect(receipt.status).toBeTruthy()
    expect(receipt.to.toLowerCase()).toBe(account4.getAddress().toLowerCase())
  }); 

  test('receiveStellar', async () => {
    jest.setTimeout(30000);// the default timeout is 5000ms

    const wallet_manager = new wallet_manager_module('stellar')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()
    let account4 = await wallet_manager.getAccount(4)
    let receiveRecord = await account4.receive()
    expect(receiveRecord[0].id).toBe('47795285128122369')
  }); 

  test('receiveEthereum', async () => {
    jest.setTimeout(30000);// the default timeout is 5000ms

    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()
    let account4 = await wallet_manager.getAccount(4)
    let receiveRecord = await account4.receive()
    expect(receiveRecord[0].blockNumber).toBe('3020019')
  }); 

  test('changeTrustStellar', async () => {
    jest.setTimeout(30000);// the default timeout is 5000ms

    const wallet_manager = new wallet_manager_module('stellar')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()
    let account8 = await wallet_manager.getAccount(8)// 8\
    let IssueingAccountAddress = 'GCYEJSMEEP7VQFFS6WELX3QSJRL3OQFIZ4MGXQL6R56P33TKBFBT2GNZ'
    let response = await account8.changeTrust('FOO',IssueingAccountAddress, '100000')
    expect(response.result_meta_xdr).toMatch(/e5qCUM9AAAAAAAAAAAAAADo1KUQAAAAAAEAAAAAAAAAAA==/)
  }); 
  
  test('encryptAndDecryptAccountETH', async () => {
    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()

    let account = await wallet_manager.getAccount()
    let encrypted = wallet_manager.encrypt(account, password)
    let decryptedAccount = wallet_manager.decrypt(encrypted, password)
    expect(decryptedAccount.getAddress()).toEqual(account.getAddress())
    expect(decryptedAccount.getPrivateKey()).toEqual(account.getPrivateKey())
    expect(decryptedAccount.getNetwork()).toEqual(account.getNetwork())
  });

  test('encryptAndDecryptAccountStellar', async () => {
    const wallet_manager = new wallet_manager_module('stellar')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()

    let account = await wallet_manager.getAccount()
    let encrypted = wallet_manager.encrypt(account, password)
    let decryptedAccount = wallet_manager.decrypt(encrypted, password)
    expect(decryptedAccount.getAddress()).toEqual(account.getAddress())
    expect(decryptedAccount.getPrivateKey()).toEqual(account.getPrivateKey())
    expect(decryptedAccount.getNetwork()).toEqual(account.getNetwork())
  });  

  test('signETH', async () => {
    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()

    let exptectedMesage ='test'
    let expectedmesageHash = '0x4a5c5d454721bbbb25540c3317521e71c373ae36458f960d2ad46ef088110e95'
    let expectedSignature = '0xc381a96085965fa17411546b655332428a63886c912af4b5bf9c215e5d4a96a95e0a2e96a0187e55933b34bec263fc5d77a7c6017b954384bbd23e9ee55ed61a1b'
    let account = await wallet_manager.getAccount()
    let signedObject = account.sign(exptectedMesage)
    expect(signedObject.message).toBe(exptectedMesage)
    expect(signedObject.messageHash).toBe(expectedmesageHash)
    expect(signedObject.signature).toBe(expectedSignature)
  });  

  test('signStellar', async () => {
    const wallet_manager = new wallet_manager_module('stellar')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()

    let exptectedMesage = JSON.parse('{"type": "Buffer", "data": [ 45, 213,184,234,218,196,224,146, 52, 91,221, 163,204, 58, 107, 21, 214, 248, 40, 72, 196, 102, 36, 11, 124, 67, 85, 89, 43, 107, 217, 203, 86, 211, 30, 40, 224, 44, 192, 194, 173, 148, 233, 22, 67, 189, 63, 199, 170, 28, 135, 20, 75, 123, 4, 238, 223, 47, 48, 5, 235, 29, 22, 6 ] }')
    let account = await wallet_manager.getAccount()
    let signedObject = account.sign('test')
    expect(signedObject.toJSON().toString()).toBe(exptectedMesage.toString())
  }); 

  test('delegatedSigningStellar', async () => {
    const wallet_manager = new wallet_manager_module('stellar')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()

    let account = await wallet_manager.getAccount(3)
    let sampleXDR = 'web+stellar:tx?xdr=AAAAAKEXb+g8NGdB5fncWTVdm1VYU/+1EaZfac9+IUMSWlldAAAAZACpzYcAAAAKAAAAAAAAAAAAAAABAAAAAQAAAAChF2/oPDRnQeX53Fk1XZtVWFP/tRGmX2nPfiFDElpZXQAAAAEAAAAAINKkmbLvxl/YKqBHgvQ/pJjOY+EBY2HA3yzTtfbpE3oAAAAAAAAAAACYloAAAAAAAAAAAA=='
    let signedObject = await account.delegatedSigning(sampleXDR)
    let expectedDestination = 'GAQNFJEZWLX4MX6YFKQEPAXUH6SJRTTD4EAWGYOA34WNHNPW5EJXU4VV'
    let expectedsignature = '28ed392bd2ebdd7158b69af45ebd4b5f86dbecf39ac96eb512337cb2ca604cbac70e52b2881efe44edc7814d672eed4aa4a64f98f78a8147e5aa8666011d6d0b'
    expect(signedObject.operations[0].destination).toBe(expectedDestination)
    expect(signedObject.signatures[0]._attributes.signature.toString('hex')).toBe(expectedsignature)
  }); 

  test('delegatedSigningEth', async () => {
    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()

    let account = await wallet_manager.getAccount(3)
    let sampleTx = '0x793aa73737a2545cd925f5c0e64529e0f422192e6bbdd53b964989943e6dedda'
    let signedObject = await account.delegatedSigning(sampleTx)
    let expectedMessageHash = '0xfa401cfe90cfb8d006def59caf30f0ceb9c9cfdbb1d9e85398aa4b0f199dbcde'
    let expectedRawTransaction = '0xf86b01843b9aca0082520894b929aaf20fd26eb8ed400914e3882e2ee952867088016345785d8a0000802ca072a334620312b2eec41552e781da6ab7247a623b7fa7c240afded7069f71e72aa073846f5e33209dacdfaa1b507fcb537cd69802bd0adba4c60703c4830b9ab2cc'
    console.log(signedObject)
    expect(signedObject.messageHash).toBe(expectedMessageHash)
    expect(signedObject.rawTransaction).toBe(expectedRawTransaction)
  }); 