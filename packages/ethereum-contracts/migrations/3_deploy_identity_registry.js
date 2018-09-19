const KeyEnums = artifacts.require('./identity/constants/KeyEnums.sol');
const IdentityRegistry = artifacts.require('./identity/IdentityRegistry.sol');

const deployContracts = async (deployer) => {
    await deployer.deploy(KeyEnums);
    await deployer.deploy(IdentityRegistry, KeyEnums.address);
};

module.exports = function deploy(deployer) {
    return deployer.then(() => deployContracts(deployer));
};
