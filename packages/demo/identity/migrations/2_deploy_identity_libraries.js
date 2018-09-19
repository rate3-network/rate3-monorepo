const Arrays = artifacts.require('./Arrays.sol');
const ECRecovery = artifacts.require('./ECRecovery.sol');
const ERC165Query = artifacts.require('./lib/ERC165Query.sol');
const KeyStore = artifacts.require('./lib/KeyStore.sol');
const ClaimStore = artifacts.require('./lib/ClaimStore.sol');
const Identity = artifacts.require('./Identity.sol');
const IdentityRegistry = artifacts.require('./IdentityRegistry.sol');

const deployContracts = async (deployer) => {
    await deployer.deploy(Arrays);
    await deployer.deploy(ECRecovery);

    await deployer.link(Arrays, KeyStore);
    await deployer.link(Arrays, ClaimStore);
    await deployer.link(ECRecovery, ClaimStore);

    await deployer.deploy(KeyStore);
    await deployer.deploy(ClaimStore);
    await deployer.deploy(ERC165Query);

    await deployer.link(KeyStore, Identity);
    await deployer.link(ClaimStore, Identity);
    await deployer.link(ERC165Query, Identity);

    await deployer.link(Arrays, IdentityRegistry);
    await deployer.link(Arrays, IdentityRegistry);
    await deployer.link(ECRecovery, IdentityRegistry);
    await deployer.link(KeyStore, IdentityRegistry);
    await deployer.link(ClaimStore, IdentityRegistry);
    await deployer.link(ERC165Query, IdentityRegistry);
};

module.exports = function deploy(deployer) {
    return deployer.then(() => deployContracts(deployer));
};
