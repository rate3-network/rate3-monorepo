let wallet_manager_module = require('./wallet_manager')
let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'

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
    var Web3 = require('web3');
    var web3 = new Web3("https://rinkeby.infura.io/v3/54add33f289d4856968099c7dff630a7");
    let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
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
    let result = await account4.send(account3.getAddress(), '50')
    expect(result._links.transaction.href).toMatch(/https:\/\/horizon-testnet.stellar.org\/transactions\//)

  });  

  // test('encryptAndDecryptAccountETH', () => {
  //   var Web3 = require('web3');
  //   var web3 = new Web3("https://rinkeby.infura.io/v3/54add33f289d4856968099c7dff630a7");
  //   let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
  //   const wallet_manager = new wallet_manager_module('ethereum')
  //   wallet_manager.setSeed(seed_phrases)
  //   wallet_manager.setWallet()

  //   let expectedPrivateKey = '0xd74635dc691ec17d2c6dedf412155faec6b628d5cc58fc5fcd44aba74d5fda7f'
  //   let expectedAddress = '0x8Ff91E4a8313F735D07c1775D4d12ddA1e930D00'
  //   let account = wallet_manager.getAccount()
  //   console.log(account, 'account')
  //   let password = 'qwerty'
  //   let encrypted = wallet_manager.encrypt(account, password)
  //   let decryptedAccount = wallet_manager.decrypt(encrypted, password)
  //   expect(decryptedAccount.getAddress()).toEqual(account.getAddress())
  //   expect(decryptedAccount.getPrivateKey()).toEqual(account.getPrivateKey())
  //   expect(decryptedAccount.getNetwork()).toEqual(account.getNetwork())
  // })

  // test('encryptAndDecryptAccountStellar', () => {
  //   let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
  //   const wallet_manager = new wallet_manager_module('stellar')
  //   wallet_manager.setSeed(seed_phrases)
  //   wallet_manager.setWallet()
  //   let expectedPrivateKey = 'SDJNCBWIH4GU377ICXYL7NEI5Z2GWOR2Y3PAQVI2HJHJ7MSB42PP4KVW'
  //   let expectedPublicKey = 'GCDAFTYQTU2YVNPCJVIZ6IT2MKSL2KRY724ODR3Y5AJ5NZ2CD6Z7A7GO'
  //   let account = wallet_manager.getAccount()
  //   let password = 'qwerty'
  //   let encrypted = wallet_manager.encrypt(account, password)
  //   let decryptedAccount = wallet_manager.decrypt(encrypted, password)
  //   expect(decryptedAccount.getAddress()).toEqual(account.getAddress())
  //   expect(decryptedAccount.getPrivateKey()).toEqual(account.getPrivateKey())
  //   expect(decryptedAccount.getNetwork()).toEqual(account.getNetwork())
  // });  

  // test('signETH', () => {
  //   var Web3 = require('web3');
  //   var web3 = new Web3("https://rinkeby.infura.io/v3/54add33f289d4856968099c7dff630a7");
  //   let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
  //   const wallet_manager = new wallet_manager_module('ethereum')
  //   wallet_manager.setSeed(seed_phrases)
  //   wallet_manager.setWallet()

  //   let expectedPrivateKey = '0xd74635dc691ec17d2c6dedf412155faec6b628d5cc58fc5fcd44aba74d5fda7f'
  //   let expectedAddress = '0x8Ff91E4a8313F735D07c1775D4d12ddA1e930D00'
  //   let exptectedMesage ='test'
  //   let expectedmesageHash = '0x4a5c5d454721bbbb25540c3317521e71c373ae36458f960d2ad46ef088110e95'
  //   let expectedSignature = '0xc381a96085965fa17411546b655332428a63886c912af4b5bf9c215e5d4a96a95e0a2e96a0187e55933b34bec263fc5d77a7c6017b954384bbd23e9ee55ed61a1b'
  //   let account = wallet_manager.getAccount()
  //   let signedObject = account.sign('test')
  //   expect(signedObject.message).toBe(exptectedMesage)
  //   expect(signedObject.messageHash).toBe(expectedmesageHash)
  //   expect(signedObject.signature).toBe(expectedSignature)
  // });  

  // test('signStellar', () => {
  //   let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
  //   const wallet_manager = new wallet_manager_module('stellar')
  //   wallet_manager.setSeed(seed_phrases)
  //   wallet_manager.setWallet()

  //   let expectedPrivateKey = 'SDJNCBWIH4GU377ICXYL7NEI5Z2GWOR2Y3PAQVI2HJHJ7MSB42PP4KVW'
  //   let expectedPublicKey = 'GCDAFTYQTU2YVNPCJVIZ6IT2MKSL2KRY724ODR3Y5AJ5NZ2CD6Z7A7GO'
  //   let exptectedMesage = JSON.parse('{"type": "Buffer", "data": [ 45, 213,184,234,218,196,224,146, 52, 91,221, 163,204, 58, 107, 21, 214, 248, 40, 72, 196, 102, 36, 11, 124, 67, 85, 89, 43, 107, 217, 203, 86, 211, 30, 40, 224, 44, 192, 194, 173, 148, 233, 22, 67, 189, 63, 199, 170, 28, 135, 20, 75, 123, 4, 238, 223, 47, 48, 5, 235, 29, 22, 6 ] }')
  //   let account = wallet_manager.getAccount()
  //   let signedObject = account.sign('test')
  //   expect(signedObject.toJSON().toString()).toBe(exptectedMesage.toString())
  // }); 