const BaseInteractor = artifacts.require("./tokenization/interactors/BaseInteractor.sol");
const BaseProxy = artifacts.require("./tokenization/BaseProxy.sol");
const BaseToken = artifacts.require("./tokenization/BaseToken.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const RegistryModule = artifacts.require("./tokenization/modules/RegistryModule.sol");

module.exports = function deployment(deployer, network, accounts) {
    // eslint-disable-next-line no-unused-vars
    const [owner, admin1, admin2, ...rest] = accounts;
  
    const deployFn = async () => {
        console.log('\nDeploying BalanceModule');
        const balance = await BalanceModule.new({ from: owner });

        console.log('\nDeploying AllowanceModule');
        const allowance = await AllowanceModule.new({ from: owner });

        console.log('\nDeploying RegistryModule');
        const registry = await RegistryModule.new({ from: owner });

        console.log('\nDeploying BaseToken');
        const token = await BaseToken.new({ from: owner });

        console.log('\nDeploying BaseProxy');
        const proxy = await BaseProxy.new(token.address, 'Test SGD', 'TESTSGD', 18, { from: owner });
        
        console.log('\nTransfer ownership of BalanceModule to Token');
        await balance.transferOwnership(token.address, { from: owner });

        console.log('\nTransfer ownership of AllowanceModule to Token');
        await allowance.transferOwnership(token.address), { from: owner };

        console.log('\nTransfer ownership of RegistryModule to Token');
        await registry.transferOwnership(token.address, { from: owner });

        console.log('\nSetting token\'s BalanceModule');
        await token.setBalanceModule(balance.address, { from: owner });

        console.log('\nSetting token\'s AllowanceModule');
        await token.setAllowanceModule(allowance.address, { from: owner });

        console.log('\nSetting token\'s RegistryModule');
        await token.setRegistryModule(registry.address, { from: owner });

        console.log('\nDeploying BaseInteractor');
        const interactor = await BaseInteractor.new(token.address, proxy.address, { from: owner });

        console.log('\nTransferring ownership of token to operations interactor');
        await token.transferOwnership(interactor.address, { from: owner });
        await interactor.setToken(token.address, { from: owner });
        await interactor.claimTokenOwnership({ from: owner });

        console.log('\nTransferring ownership of proxy to operations interactor');
        await proxy.transferOwnership(interactor.address, { from: owner });
        await interactor.setProxy(proxy.address, { from: owner });
        await interactor.claimProxyOwnership({ from: owner });

        console.log('\nSet token on proxy');
        await interactor.setTokenOnProxy(token.address, { from: owner });

        console.log('\nSet proxy on token');
        await interactor.setProxyOnToken(proxy.address, { from: owner });

        console.log('\nSetting admin 1 (approval) of BaseInteractor');
        await interactor.setFirstAdmin(admin1, { from: owner });

        console.log('\nSetting admin 2 (finalize) of BaseInteractor');
        await interactor.setSecondAdmin(admin2, { from: owner });
        
  
      console.log('\n===== Addresses ======');
      console.log('AllowanceModule:', allowance.address);
      console.log('BalanceModule:  ', balance.address);
      console.log('RegistryModule: ', registry.address);
      console.log('Token:          ', token.address);
      console.log('Proxy:          ', proxy.address);
      console.log('Interactor:     ', interactor.address);
      console.log('======================\n');

      console.log('\n===== Admins ======');
      console.log('Owner:          ', owner);
      console.log('Admin1:         ', admin1);
      console.log('Admin2:         ', admin2);
      console.log('======================\n');
    };
  
    return deployer.then(() => deployFn()).catch(console.error);
  };
