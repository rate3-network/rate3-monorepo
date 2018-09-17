import {
    AccountsSetupConfig,
    setupTest,
    Purpose,
    KeyType,
} from './base';
import {
    assertOkTx,
    printTestGas,
    assertRevert,
} from './util';

contract('Pausable', async (addrs) => {
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

    it('should be paused/unpaused by management keys', async () => {
        await assertOkTx(identity.pause({ from: accounts.manager[0].addr }));
        // Can't add key
        await assertRevert(identity.addKey(accounts.action[2].key, Purpose.ACTION, KeyType.ECDSA, {
            from: accounts.manager[0].addr,
        }));
        await assertOkTx(identity.unpause({ from: accounts.manager[1].addr }));
    });

    it('should not be paused by others', async () => {
        await assertRevert(identity.pause({ from: accounts.action[1].addr }));
    });
});
