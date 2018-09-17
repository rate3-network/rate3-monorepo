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
    let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed(seed_phrases)
    expect(wallet_manager.getSeed()).toBe(seed_phrases);
  });  

test('setWallet', () => {
    let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()
    let privateExtendedKey = 'xprv9s21ZrQH143K292aVhhDBd8vpauoKCEM1Rd26jKjs4bq9Juwdug4cSXPgeYdKuVwN4RWQy7HCFundYP5neF4WLjuqDTMW6uvB7SXNWM9mU3'
    expect(wallet_manager.getWallet().privateExtendedKey()).toBe(privateExtendedKey);
  });   

test('setWallet', () => {
    let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
    const wallet_manager = new wallet_manager_module('ethereum')
    wallet_manager.setSeed(seed_phrases)
    wallet_manager.setWallet()
    let privateKey = 'd74635dc691ec17d2c6dedf412155faec6b628d5cc58fc5fcd44aba74d5fda7f'
    expect(wallet_manager.getAccount()._hdkey._privateKey.toString('hex')).toBe(privateKey);
  });  

