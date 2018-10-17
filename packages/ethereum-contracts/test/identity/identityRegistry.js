import { StrKey } from 'stellar-base';
import {
    Purpose,
    assertKeyCount,
    addrToBytes32,
    Blockchain,
} from './base';
import {
    printTestGas,
    assertOkTx,
    assertRevert,
} from './util';

const EthereumIdentityAccounts = artifacts
    .require('./identity/accounts/EthereumIdentityAccounts.sol');
const StellarIdentityAccounts = artifacts
    .require('./identity/accounts/StellarIdentityAccounts.sol');
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

    describe('Test - Ethereum Identity accounts', () => {
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
            let linkedIdentity = await ethIdentityAccounts.getIdentity(anotherAccount);
            linkedIdentity.should.not.be.equal(identity.address);

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

            linkedIdentity = await ethIdentityAccounts.getIdentity(anotherAccount);
            linkedIdentity.should.be.equal(identity.address);
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

    describe('Test - Stellar Identity accounts', () => {
        // address of owner account for stellar identity accounts contract
        let bridgeOwner;

        // stellar identity accounts contract
        let stellarIdentityAccounts;

        let identity;

        const stellarPublicKey = 'GCCU5Z6CUZKONMVKLUJAGNMGE6455LJ2P7YZIF3DQXMPBB3DBZIHXSNQ';
        const stellarAddress = `0x${
            StrKey.decodeEd25519PublicKey(stellarPublicKey).toString('hex')
        }`;

        beforeEach('Deploy stellar identity account', async () => {
            await registry.setEthereumIdentityAccounts(
                ethIdentityAccounts.address,
            );
            bridgeOwner = addrs[4]; // eslint-disable-line prefer-destructuring
            stellarIdentityAccounts = await StellarIdentityAccounts.new(
                registry.address,
                { from: bridgeOwner },
            );
            await registry.setIdentityAccounts(
                Blockchain.STELLAR,
                stellarIdentityAccounts.address,
            );

            const r = await registry.createIdentity({ from: addrs[0] });
            const identityAddr = findIdentityAddress(r);
            identity = Identity.at(identityAddr);
        });

        it('should be able to link new stellar account to identity', async () => {
            let linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(0);
            let linkedIdentity = await stellarIdentityAccounts.getIdentity(stellarAddress);
            linkedIdentity.should.not.be.equal(identity.address);

            await assertOkTx(stellarIdentityAccounts.addAccount(
                identity.address,
                stellarAddress,
                { from: bridgeOwner },
            ));

            // No accounts linked
            linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(0);

            const data = stellarIdentityAccounts.contract.approve.getData(
                identity.address,
                stellarAddress,
            );
            await assertOkTx(identity.execute(
                stellarIdentityAccounts.address,
                0,
                data,
                { from: addrs[0] },
            ));

            // Check account linked
            linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);
            linkedAccounts[0].should.be.equal(stellarAddress);

            const encodedStellarAddress = StrKey.encodeEd25519PublicKey(
                Buffer.from(linkedAccounts[0].slice(2), 'hex'),
            ).toString();

            encodedStellarAddress.should.be.equal(stellarPublicKey);

            linkedIdentity = await stellarIdentityAccounts.getIdentity(stellarAddress);
            linkedIdentity.should.be.equal(identity.address);
        });

        it('should fail to add account if not owner', async () => {
            let linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(0);

            await assertRevert(stellarIdentityAccounts.addAccount(
                identity.address,
                stellarAddress,
                { from: addrs[0] },
            ));

            // No accounts linked
            linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(0);
        });

        it('should fail to approve add if not identity', async () => {
            let linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(0);

            await assertOkTx(stellarIdentityAccounts.addAccount(
                identity.address,
                stellarAddress,
                { from: bridgeOwner },
            ));

            // No accounts linked
            linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(0);

            const data = stellarIdentityAccounts.contract.approve.getData(
                identity.address,
                stellarAddress,
            );
            await assertRevert(identity.execute(
                stellarIdentityAccounts.address,
                0,
                data,
                { from: bridgeOwner },
            ));

            // Check account linked
            linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(0);
        });

        it('should be able to remove account by identity', async () => {
            let linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(0);

            await assertOkTx(stellarIdentityAccounts.addAccount(
                identity.address,
                stellarAddress,
                { from: bridgeOwner },
            ));

            // No accounts linked
            linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(0);

            const addData = stellarIdentityAccounts.contract.approve.getData(
                identity.address,
                stellarAddress,
            );
            await assertOkTx(identity.execute(
                stellarIdentityAccounts.address,
                0,
                addData,
                { from: addrs[0] },
            ));

            // Check account linked
            linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);
            linkedAccounts[0].should.be.equal(stellarAddress);

            const removeData = stellarIdentityAccounts.contract.removeAccount.getData(
                identity.address,
                stellarAddress,
            );
            await assertOkTx(identity.execute(
                stellarIdentityAccounts.address,
                0,
                removeData,
                { from: addrs[0] },
            ));

            // Check account removed
            linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(0);
        });

        it('should fail to remove account if not identity', async () => {
            let linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(0);

            await assertOkTx(stellarIdentityAccounts.addAccount(
                identity.address,
                stellarAddress,
                { from: bridgeOwner },
            ));

            // No accounts linked
            linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(0);

            const addData = stellarIdentityAccounts.contract.approve.getData(
                identity.address,
                stellarAddress,
            );
            await assertOkTx(identity.execute(
                stellarIdentityAccounts.address,
                0,
                addData,
                { from: addrs[0] },
            ));

            // Check account linked
            linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);
            linkedAccounts[0].should.be.equal(stellarAddress);

            const removeData = stellarIdentityAccounts.contract.removeAccount.getData(
                identity.address,
                stellarAddress,
            );
            await assertRevert(identity.execute(
                stellarIdentityAccounts.address,
                0,
                removeData,
                { from: bridgeOwner },
            ));

            // Check account not removed
            linkedAccounts = await stellarIdentityAccounts.getAccounts(identity.address);
            linkedAccounts.should.have.a.lengthOf(1);
            linkedAccounts[0].should.be.equal(stellarAddress);
        });
    });
});
