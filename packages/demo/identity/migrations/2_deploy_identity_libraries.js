const Arrays = artifacts.require('./lib/Arrays.sol');
const Identity = artifacts.require('./Identity.sol');
const IdentityRegistry = artifacts.require('./IdentityRegistry.sol');

const deployContracts = async (deployer) => {
    await deployer.deploy(Arrays);
    await deployer.link(Arrays, Identity);
    await deployer.link(Arrays, IdentityRegistry);
};

module.exports = function deploy(deployer) {
    return deployer.then(() => deployContracts(deployer));
};
