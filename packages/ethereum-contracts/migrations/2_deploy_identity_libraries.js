const Arrays = artifacts.require('./lib/Arrays.sol');
const ECRecovery = artifacts.require('./lib/ECRecovery.sol');
const ERC165Query = artifacts.require('./identity/lib/ERC165Query.sol');
const KeyStore = artifacts.require('./identity/lib/KeyStore.sol');
const ClaimStore = artifacts.require('./identity/lib/ClaimStore.sol');
const ExecutionStore = artifacts.require('./identity/lib/ExecutionStore.sol');
const Identity = artifacts.require('./identity/Identity.sol');
const IdentityRegistry = artifacts.require('./identity/IdentityRegistry.sol');
const TestContract = artifacts.require('./identity/TestContract.sol');

const deployContracts = async (deployer) => {
    await deployer.deploy(Arrays);
    await deployer.deploy(ECRecovery);

    await deployer.link(Arrays, KeyStore);
    await deployer.link(Arrays, ClaimStore);
    await deployer.link(Arrays, ExecutionStore);
    await deployer.link(ECRecovery, ClaimStore);

    await deployer.deploy(KeyStore);
    await deployer.deploy(ClaimStore);
    await deployer.deploy(ERC165Query);

    await deployer.link(KeyStore, ExecutionStore);

    await deployer.deploy(ExecutionStore);

    await deployer.link(Arrays, Identity);
    await deployer.link(KeyStore, Identity);
    await deployer.link(ClaimStore, Identity);
    await deployer.link(ExecutionStore, Identity);
    await deployer.link(ERC165Query, Identity);

    await deployer.link(Arrays, IdentityRegistry);
    await deployer.link(ECRecovery, IdentityRegistry);
    await deployer.link(KeyStore, IdentityRegistry);
    await deployer.link(ClaimStore, IdentityRegistry);
    await deployer.link(ExecutionStore, IdentityRegistry);
    await deployer.link(ERC165Query, IdentityRegistry);

    await deployer.link(ERC165Query, TestContract);
};

module.exports = function deploy(deployer) {
    return deployer.then(() => deployContracts(deployer));
};
