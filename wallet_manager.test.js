let wallet_manager_module = require('./wallet_manager')
//import wallet_manager from './wallet_manager'
test('createWalletManagerInstance', () => {
    const wallet_manager = new wallet_manager_module('ethereum')
    expect(wallet_manager.getNetwork()).toBe('ethereum');
  });