
/* global artifacts */
/* eslint-disable no-console */
const AllowanceModule = artifacts.require('../contracts/tokenization/modules/AllowanceModule.sol');
const BalanceModule = artifacts.require('../contracts/tokenization/modules/BalanceModule.sol');
const TokenizeTemplateToken = artifacts.require('../contracts/tokenization/TokenizeTemplateToken.sol');
const OperationsInteractor = artifacts.require('../contracts/tokenization/interactors/OperationsInteractor.sol');

module.exports = function deployment(deployer, network, accounts) {
  // eslint-disable-next-line no-unused-vars
  const [owner, admin, ...rest] = accounts;

  const deployFn = async () => {
    console.log('\nDeploying AllowanceModule');
    const allowance = await AllowanceModule.new();

    console.log('\nDeploying BalanceModule');
    const balance = await BalanceModule.new();

    console.log('\nDeploying TokenizeTemplateToken');
    const token = await TokenizeTemplateToken.new();

    console.log('\nTransfer ownership of AllowanceModule to Token');
    await allowance.transferOwnership(token.address);

    console.log('\nTransfer ownership of BalanceModule to Token');
    await balance.transferOwnership(token.address);

    console.log('\nSetting token\'s AllowanceModule');
    await token.setAllowanceModule(allowance.address);

    console.log('\nSetting token\'s BalanceModule');
    await token.setBalanceModule(balance.address);

    console.log('\nDeploying OperationsInteractor');
    const ops = await OperationsInteractor.new([token.address]);

    console.log('\nSetting admin of OperationsInteractor');
    await ops.setAdmin(admin);

    console.log('\nTransferring ownership of token to operations interactor');
    await token.transferOwnership(ops.address);
    await ops.setToken(token.address);

    console.log('\n===== Addresses ======');
    console.log('AllowanceModule:', allowance.address);
    console.log('BalanceModule:  ', balance.address);
    console.log('Token:          ', token.address);
    console.log('Operations:     ', ops.address);
    console.log('======================\n');
  };

  return deployer.then(() => deployFn()).catch(console.error);
};
