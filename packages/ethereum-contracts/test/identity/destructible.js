import {
    AccountsSetupConfig,
    setupTest,
    Purpose,
} from './base';
import {
    assertOkTx,
    printTestGas,
    assertRevert,
} from './util';

contract('Destructible', async (addrs) => {
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

    it('should be killed by management keys', async () => {
        assert.notEqual(web3.eth.getCode(identity.address), '0x0');
        await assertOkTx(identity.destroyAndSend(accounts.manager[0].addr, {
            from: accounts.manager[1].addr,
        }));
        assert.strictEqual(web3.eth.getCode(identity.address), '0x0');
    });

    it('should not be killed by others', async () => {
        await assertRevert(identity.destroyAndSend(accounts.action[2].addr, {
            from: accounts.action[2].addr,
        }));
    });
});
