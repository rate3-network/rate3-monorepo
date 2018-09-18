let wallet_manager_module = require('./wallet_manager')

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
    let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()
    let privateExtendedKey = 'xprv9s21ZrQH143K292aVhhDBd8vpauoKCEM1Rd26jKjs4bq9Juwdug4cSXPgeYdKuVwN4RWQy7HCFundYP5neF4WLjuqDTMW6uvB7SXNWM9mU3'
    expect(wallet_manager.getWallet().privateExtendedKey()).toBe(privateExtendedKey);
  });   

test('setWalletStellar', () => {
    let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
    const wallet_manager = new wallet_manager_module('stellar')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()
    let seedHex = '00f014c45065a22e90993dec1a6ea5ec0d71aa7b556f72649814a7169861a0d4adc745570dafac9d925df4007d113ad43372886dce61ec62644441b7a072f3e2'
    expect(wallet_manager.getWallet().seedHex).toBe(seedHex);
  }); 

test('setAccountETH', () => {
    var Web3 = require('web3');
    var web3 = new Web3("https://rinkeby.infura.io/v3/54add33f289d4856968099c7dff630a7");
    let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()

    let expectedPrivateKey = '0xd74635dc691ec17d2c6dedf412155faec6b628d5cc58fc5fcd44aba74d5fda7f'
    let expectedAddress = '0x8Ff91E4a8313F735D07c1775D4d12ddA1e930D00'
    let account = wallet_manager.getAccount()
    expect(account.getAddress()).toBe(expectedAddress);
    expect(account.getPrivateKey()).toBe(expectedPrivateKey)

    expectedAddress = '0x2d8Cce8A8B308a077Eb0e39331258c355c55d04e'
    expectedPrivateKey = '0xb1cf5f0991e165de0e832bb3304846f0e902c0fdef39deece4c14f6625dc5a61'
    account = wallet_manager.getAccount(5)
    expect(account.getAddress()).toBe(expectedAddress);
    expect(account.getPrivateKey()).toBe(expectedPrivateKey)
  });  

test('setAccountStellar', () => {
    let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
    const wallet_manager = new wallet_manager_module('stellar')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()
    let expectedPrivateKey = 'SDJNCBWIH4GU377ICXYL7NEI5Z2GWOR2Y3PAQVI2HJHJ7MSB42PP4KVW'
    let expectedPublicKey = 'GCDAFTYQTU2YVNPCJVIZ6IT2MKSL2KRY724ODR3Y5AJ5NZ2CD6Z7A7GO'
    let account = wallet_manager.getAccount()
    expect(account.getPrivateKey()).toBe(expectedPrivateKey);
    expect(account.getAddress()).toBe(expectedPublicKey);

    expectedPrivateKey = 'SCHDEOGWKZYYHDTCQFEXMQ3VVDCOZIUBVSJN4DGTOCB5FCCKBYQEG4PA'
    expectedPublicKey = 'GCUTV7FC4GITQI6KJASMKH7WX3NTDLNUBHFZNXVJB4DJGGTUL6I7XAVT'
    account = wallet_manager.getAccount(10)
    expect(account.getPrivateKey()).toBe(expectedPrivateKey);
    expect(account.getAddress()).toBe(expectedPublicKey);
  });  

  test('encryptAndDecryptAccountETH', () => {
    var Web3 = require('web3');
    var web3 = new Web3("https://rinkeby.infura.io/v3/54add33f289d4856968099c7dff630a7");
    let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()

    let expectedPrivateKey = '0xd74635dc691ec17d2c6dedf412155faec6b628d5cc58fc5fcd44aba74d5fda7f'
    let expectedAddress = '0x8Ff91E4a8313F735D07c1775D4d12ddA1e930D00'
    let account = wallet_manager.getAccount()
    let password = 'qwerty'
    let encrypted = wallet_manager.encrypt(account, password)
    let decryptedAccount = wallet_manager.decrypt(encrypted, password)
    expect(decryptedAccount.getAddress()).toEqual(account.getAddress())
    expect(decryptedAccount.getPrivateKey()).toEqual(account.getPrivateKey())
    expect(decryptedAccount.getNetwork()).toEqual(account.getNetwork())
  })

  test('encryptAndDecryptAccountStellar', () => {
    let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
    const wallet_manager = new wallet_manager_module('stellar')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()
    let expectedPrivateKey = 'SDJNCBWIH4GU377ICXYL7NEI5Z2GWOR2Y3PAQVI2HJHJ7MSB42PP4KVW'
    let expectedPublicKey = 'GCDAFTYQTU2YVNPCJVIZ6IT2MKSL2KRY724ODR3Y5AJ5NZ2CD6Z7A7GO'
    let account = wallet_manager.getAccount()
    let password = 'qwerty'
    let encrypted = wallet_manager.encrypt(account, password)
    let decryptedAccount = wallet_manager.decrypt(encrypted, password)
    expect(decryptedAccount.getAddress()).toEqual(account.getAddress())
    expect(decryptedAccount.getPrivateKey()).toEqual(account.getPrivateKey())
    expect(decryptedAccount.getNetwork()).toEqual(account.getNetwork())
  });  