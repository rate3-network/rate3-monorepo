import {
    Purpose,
    assertKeyCount,
    addrToBytes32,
} from './base';
import {
    printTestGas,
    assertOkTx,
} from './util';

const IdentityRegistry = artifacts.require('./identity/IdentityRegistry.sol');
const Identity = artifacts.require('./identity/Identity.sol');

contract('IdentityRegistry', async (addrs) => {
    let registry;

    afterEach('print gas', printTestGas);

    beforeEach('new contract', async () => {
        registry = await IdentityRegistry.new();
    });
    const findIdentityAddress = r => (
        r.logs.find(e => e.event === 'NewIdentity').args.identityAddress
    );

    describe('createIdentity', () => {
        it('is created', async () => {
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
        });

        describe('after created', async () => {
            let identity;

            beforeEach('new contract', async () => {
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
        });
    });
});
