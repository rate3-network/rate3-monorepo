const Arrays = artifacts.require('./lib/Arrays.sol');
const Identity = artifacts.require('./identity/Identity.sol');

const deployContracts = async (deployer) => {
    await deployer.deploy(Arrays);
    await deployer.link(Arrays, Identity);
};

module.exports = function deploy(deployer) {
    return deployer.then(() => deployContracts(deployer));
};
