import {
    AccountsSetupConfig,
    setupTest,
    Purpose,
    KeyType,
} from './base';
import { printTestGas } from './util';

contract('KeyGetters Tests', async (addrs) => {
    let identity;
    let accounts;

    afterEach('print gas', printTestGas);

    beforeEach('new contract', async () => {
        const config = (new AccountsSetupConfig())
            .setAnotherAccount(addrs[0])
            .setIdentityAccount(addrs[1])
            .pushAccount(Purpose.MANAGEMENT, addrs[2])
            .pushAccount(Purpose.MANAGEMENT, addrs[3], false)
            .pushAccount(Purpose.ACTION, addrs[4])
            .pushAccount(Purpose.ACTION, addrs[5], false)
            .pushAccount(Purpose.CLAIM, addrs[6], false);

        ({ identity, accounts } = await setupTest(config));
    });

    // Getters
    describe('Test - Key purpose', async () => {
        it('should return keys that exist', async () => {
            assert.isTrue(await identity.keyHasPurpose(
                accounts.manager[1].key,
                Purpose.MANAGEMENT,
            ));
            assert.isTrue(await identity.keyHasPurpose(
                accounts.action[0].key,
                Purpose.ACTION,
            ));
        });

        it('should not return keys that don\'t exist', async () => {
            assert.isFalse(await identity.keyHasPurpose(
                accounts.manager[1].key,
                Purpose.ACTION,
            ));
            assert.isFalse(await identity.keyHasPurpose(
                accounts.action[1].key,
                Purpose.MANAGEMENT,
            ));
        });
    });

    describe('Test - Get key', async () => {
        it('should return key data', async () => {
            const [purposes, keyType, key] = await identity.getKey(
                accounts.manager[1].key,
            );
            keyType.should.be.bignumber.equal(KeyType.ECDSA);
            key.should.be.bignumber.equal(accounts.manager[1].key);
            assert.equal(purposes.length, 1);
            purposes[0].should.be.bignumber.equal(Purpose.MANAGEMENT);
        });

        it('should return multiple purposes', async () => {
            const [purposes, keyType, key] = await identity.getKey(
                accounts.action[0].key,
            );
            keyType.should.be.bignumber.equal(KeyType.ECDSA);
            key.should.be.bignumber.equal(accounts.action[0].key);
            assert.equal(purposes.length, 3);
            purposes[0].should.be.bignumber.equal(Purpose.MANAGEMENT);
            purposes[1].should.be.bignumber.equal(Purpose.ACTION);
            purposes[2].should.be.bignumber.equal(Purpose.CLAIM);
        });

        it('should not return keys without purpose', async () => {
            const [purposes, keyType, key] = await identity.getKey(
                accounts.action[2].key,
            );
            keyType.should.be.bignumber.equal(0);
            key.should.be.bignumber.equal(0);
            assert.equal(purposes.length, 0);
        });
    });

    describe('Test - Get keys by purpose', async () => {
        it('should return all management keys', async () => {
            const k = await identity.getKeysByPurpose(Purpose.MANAGEMENT);
            assert.equal(k.length, 2);
            assert.equal(accounts.manager[0].key, k[0]);
            assert.equal(accounts.manager[1].key, k[1]);
        });

        it('should return all action keys', async () => {
            const k = await identity.getKeysByPurpose(Purpose.ACTION);
            assert.equal(k.length, 2);
            assert.equal(accounts.action[0].key, k[0]);
            assert.equal(accounts.action[1].key, k[1]);
        });

        it('should not return keys that haven\'t been added', async () => {
            const k = await identity.getKeysByPurpose(Purpose.ENCRYPT);
            assert.equal(k.length, 0);
        });
    });
});
