import {
    Purpose,
    assertKeyCount,
    addrToBytes32,
} from './base';
import {
    printTestGas,
    assertOkTx,
    assertRevert,
} from './util';

const EthereumIdentityAccounts =
    artifacts.require('./identity/accounts/EthereumIdentityAccounts.sol');
const IdentityRegistry = artifacts.require('./identity/IdentityRegistry.sol');
const Identity = artifacts.require('./identity/Identity.sol');
const KeyEnums = artifacts.require('./identity/constants/KeyEnums.sol');

contract('IdentityRegistry Test', async (addrs) => {
    let registry;
    let ethIdentityAccounts;

    afterEach('print gas', printTestGas);

    beforeEach('new contract', async () => {
        const keyEnums = await KeyEnums.deployed();
        registry = await IdentityRegistry.new(keyEnums.address);
        ethIdentityAccounts = await EthereumIdentityAccounts.new(registry.address);
    });

    const findIdentityAddress = r => (
        r.logs.find(e => e.event === 'NewIdentity').args.identity
    );

    describe('Test - Create identity', () => {
        it('should fail if ethereum identity contract is not set', async () => {
            await assertRevert(registry.createIdentity({ from: addrs[0] }));
        });

        it('should fail if ethereum identity contract has a different registry', async () => {
            const badContract = await EthereumIdentityAccounts.new(
                ethIdentityAccounts.address,
            );
            await assertRevert(registry.setEthereumIdentityAccounts(
                badContract.address,
            ));
        });

        it('should be created', async () => {
            await assertOkTx(registry.setEthereumIdentityAccounts(
                ethIdentityAccounts.address,
            ));
            const r = await assertOkTx(registry.createIdentity({ from: addrs[0] }));
            const identityAddr = findIdentityAddress(r);
            const identity = Identity.at(identityAddr);

            // ERC165
            assert.isFalse(await identity.supportsInterface('0xffffffff'));
            assert.isTrue(await identity.supportsInterface('0x01ffc9a7'));
            // ERC725
            assert.isTrue(await identity.supportsInterface('0xdc3d2a7b'));
            // ERC735
            assert.isTrue(await identity.supportsInterface('0xb6b4ee6d'));
            // ERC725 + ERC735
            assert.isTrue(await identity.supportsInterface('0x6a89c416'));

            const identityAccounts = await registry.networkAccounts.call(
                (await registry.ETH_NETWORK()).toString(),
            );
            identityAccounts.should.be.equal(ethIdentityAccounts.address);
        });

        describe('Test - After created', async () => {
            let identity;

            beforeEach('new contract', async () => {
                await registry.setEthereumIdentityAccounts(
                    ethIdentityAccounts.address,
                );
                const r = await registry.createIdentity({ from: addrs[0] });
                const identityAddr = findIdentityAddress(r);
                identity = Identity.at(identityAddr);
            });

            it('should have registered identity', async () => {
                assert.isTrue(await registry.hasIdentity(addrs[0]));
            });

            it('should have keys', async () => {
                await assertKeyCount(identity, Purpose.MANAGEMENT, 1);
                await assertKeyCount(identity, Purpose.ACTION, 1);
                await assertKeyCount(identity, Purpose.CLAIM, 1);
                await assertKeyCount(identity, Purpose.ENCRYPT, 0);

                const key = addrToBytes32(addrs[0]);
                assert.isTrue(await identity.keyHasPurpose(key, Purpose.MANAGEMENT));
                assert.isTrue(await identity.keyHasPurpose(key, Purpose.ACTION));
                assert.isTrue(await identity.keyHasPurpose(key, Purpose.CLAIM));
                assert.isFalse(await identity.keyHasPurpose(key, Purpose.ENCRYPT));
            });

            it('should have ethereum account linked to identity', async () => {
                const account = addrToBytes32(addrs[0]);
                const linkedIdentity = await ethIdentityAccounts.getIdentity(account);
                linkedIdentity.should.be.equal(identity.address);

                const linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
                linkedAccounts.should.have.a.lengthOf(1);
                linkedAccounts[0].should.be.equal(account);
            });
        });
    });

    describe('Test - Identity accounts', () => {
        let identity;

        beforeEach('registry', async () => {
            await registry.setEthereumIdentityAccounts(
                ethIdentityAccounts.address,
            );
            const r = await registry.createIdentity({ from: addrs[0] });
            const identityAddr = findIdentityAddress(r);
            identity = Identity.at(identityAddr);
        });

        it('should be able to link new ethereum account to identity', async () => {
            const anotherAddr = addrs[1];
            const anotherAccount = addrToBytes32(anotherAddr);

            let linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);

            await assertOkTx(ethIdentityAccounts.addAccount(
                identity.address,
                anotherAccount,
                { from: anotherAddr },
            ));

            // Only initial account linked
            linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);

            const data = ethIdentityAccounts.contract.approve.getData(
                identity.address,
                anotherAccount,
            );
            await assertOkTx(identity.execute(
                ethIdentityAccounts.address,
                0,
                data,
                { from: addrs[0] },
            ));

            // Only initial account linked
            linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(2);
            linkedAccounts[1].should.be.equal(anotherAccount);
        });

        it('should fail to add if not called by account added', async () => {
            const anotherAddr = addrs[1];
            const anotherAccount = addrToBytes32(anotherAddr);

            let linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);

            await assertRevert(ethIdentityAccounts.addAccount(
                identity.address,
                anotherAccount,
                { from: addrs[2] }, // Use some other account
            ));

            // Only initial account linked
            linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);
        });

        it('should fail to approve add if not called by identity', async () => {
            const anotherAddr = addrs[1];
            const anotherAccount = addrToBytes32(anotherAddr);

            let linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);

            await assertOkTx(ethIdentityAccounts.addAccount(
                identity.address,
                anotherAccount,
                { from: anotherAddr },
            ));

            // Only initial account linked
            linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);

            await assertRevert(ethIdentityAccounts.approve(
                identity.address,
                anotherAccount,
                { from: addrs[2] }, // Use some other account
            ));

            // Only initial account linked
            linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);
        });

        it('should be able to remove account', async () => {
            // Only initial account linked
            let linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);

            const data = ethIdentityAccounts.contract.removeAccount.getData(
                identity.address,
                addrToBytes32(addrs[0]),
            );
            await assertOkTx(identity.execute(
                ethIdentityAccounts.address,
                0,
                data,
                { from: addrs[0] },
            ));

            linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(0);
        });

        it('should fail if account to remove doesn\'t exist', async () => {
            // Only initial account linked
            let linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);

            const data = ethIdentityAccounts.contract.removeAccount.getData(
                identity.address,
                addrToBytes32(addrs[1]),
            );
            await identity.execute(
                ethIdentityAccounts.address,
                0,
                data,
                { from: addrs[0] },
            );

            linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);
        });

        it('should fail to approve remove if not called by identity', async () => {
            let linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);

            await assertRevert(ethIdentityAccounts.removeAccount(
                identity.address,
                addrToBytes32(addrs[0]),
                { from: addrs[2] }, // Use some other account
            ));

            linkedAccounts = await ethIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);
        });
    });
});
