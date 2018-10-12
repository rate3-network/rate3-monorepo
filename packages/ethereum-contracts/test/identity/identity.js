import {
    AccountsSetupConfig,
    setupTest,
    Purpose,
    Topic,
} from './base';
import {
    printTestGas,
    assertOkTx,
} from './util';

const TestContract = artifacts.require('./identity/TestContract.sol');
const ClaimStore = artifacts.require('./identity/lib/ClaimStore.sol');
const KeyStore = artifacts.require('./identity/lib/KeyStore.sol');

contract('Identity Tests', async (addrs) => {
    let identity;
    let accounts;

    const oneUnit = web3.toWei(100, 'finney');

    afterEach('print gas', printTestGas);

    beforeEach('new contract', async () => {
        const config = (new AccountsSetupConfig())
            .setAnotherAccount(addrs[0])
            .setIdentityAccount(addrs[1])
            .pushAccount(Purpose.MANAGEMENT, addrs[2])
            .pushAccount(Purpose.MANAGEMENT, addrs[3], false)
            .pushAccount(Purpose.ACTION, addrs[4])
            .pushAccount(Purpose.ACTION, addrs[5], false);

        ({ identity, accounts } = await setupTest(
            config,
            [
                {
                    topic: Topic.LABEL,
                    data: 'Rate Engineering',
                    uri: 'https://github.com/rate-engineering',
                    self: true,
                },
            ],
        ));
    });

    it('should receive ether', async () => {
        // Start with 0
        let balance = web3.eth.getBalance(identity.address);
        balance.should.be.bignumber.equal(0);
        // Receive
        await assertOkTx(identity.sendTransaction({
            from: accounts.another.addr,
            value: oneUnit,
        }));
        // Has ether
        balance = web3.eth.getBalance(identity.address);
        balance.should.be.bignumber.equal(oneUnit);
    });

    it('should send ether', async () => {
        // Receive
        await assertOkTx(identity.sendTransaction({
            from: accounts.another.addr,
            value: oneUnit,
        }));
        const currentBalance = web3.eth.getBalance(accounts.another.addr);
        // Send back using ACTION key
        await assertOkTx(identity.execute(
            accounts.another.addr,
            oneUnit,
            '',
            { from: accounts.action[0].addr },
        ));
        // 0 again
        let balance = web3.eth.getBalance(identity.address);
        balance.should.be.bignumber.equal(0);
        // Address got money back
        balance = web3.eth.getBalance(accounts.another.addr);
        balance.should.be.bignumber.greaterThan(currentBalance);
    });

    it('can validate claims off-chain', async () => {
        // You claim to be identity.address, I give you a random string to sign
        const challenge = web3.sha3('random-string');
        // You give me back the signature
        const signature = web3.eth.sign(accounts.action[0].addr, challenge);
        // I recover address from signature
        // Using contract helper function here, but any implementation of ECRecover will do
        const claimStore = await ClaimStore.deployed();
        const keyStore = await KeyStore.deployed();
        const signedBy = await claimStore.getSignatureAddress(challenge, signature);
        const signedByKey = await keyStore.addrToKey(signedBy);
        // Check if this is an action key in the identity you claim
        assert.isTrue(await identity.keyHasPurpose(signedByKey, Purpose.ACTION));
    });

    it('can validate claims on-chain', async () => {
        const label = 'Rate Engineering';
        const test = await TestContract.new();
        // Identity contract calls TestContract.whoCalling
        const data = test.contract.whoCalling.getData();
        await assertOkTx(identity.execute(
            test.address,
            0,
            data,
            { from: accounts.action[0].addr },
        ));
        // Check TestContract events
        const event = test.contract.IdentityCalled();
        event.watch((e, r) => {
            assert.equal(
                // Convert bytes to string and trim
                web3.toAscii(r[0].args.data).slice(0, label.length),
                label,
            );
        });
        event.stopWatching();
    });
});
