const IdentityRegistry = artifacts.require('./identity/IdentityRegistry.sol');

const deployContracts = async (deployer) => {
    await deployer.deploy(IdentityRegistry);
};

module.exports = function deploy(deployer) {
    return deployer.then(() => deployContracts(deployer));
};
