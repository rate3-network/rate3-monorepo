import {
    AccountsSetupConfig,
    setupTest,
    assertKeyCount,
    Purpose,
    KeyType,
} from './base';
import {
    printTestGas,
    assertOkTx,
    assertRevert,
} from './util';
import getEvents from '../helpers/getEvents';

const TestContract = artifacts.require('./identity/TestContract.sol');

contract('MultiSig Tests', async (addrs) => {
    let identity;
    let accounts;
    let otherContract;

    afterEach('print gas', printTestGas);

    beforeEach('new contract', async () => {
        const config = (new AccountsSetupConfig())
            .setAnotherAccount(addrs[0])
            .setIdentityAccount(addrs[1])
            .pushAccount(Purpose.MANAGEMENT, addrs[2])
            .pushAccount(Purpose.MANAGEMENT, addrs[3])
            .pushAccount(Purpose.MANAGEMENT, addrs[4], false)
            .pushAccount(Purpose.ACTION, addrs[5])
            .pushAccount(Purpose.ACTION, addrs[6])
            .pushAccount(Purpose.ACTION, addrs[7], false);

        ({ identity, accounts } = await setupTest(config));
        otherContract = await TestContract.new();
    });

    const findExecutionId = r => (
        // You will not get that return value inside this result.
        // You must instead use an event and look up the result in the logs array.
        r.logs.find(e => e.event === 'ExecutionRequested').args.executionId
    );

    describe('Test - Execute own identity functions', async () => {
        it('should add key', async () => {
            await assertKeyCount(identity, Purpose.ACTION, 3);

            const addKeyData = await identity.contract.addKey.getData(
                accounts.action[3].key,
                Purpose.ACTION,
                KeyType.ECDSA,
            );
            await assertOkTx(identity.execute(
                identity.address,
                0,
                addKeyData,
                { from: accounts.manager[0].addr },
            ));

            let logs = await getEvents(identity, {
                event: 'ExecutionRequested',
                args: {
                    to: identity.address,
                    value: new web3.BigNumber(0),
                    data: addKeyData,
                },
            });
            logs.should.have.a.lengthOf(1);
            const { args: { executionId } } = logs[0];

            logs = await getEvents(identity, {
                event: 'Executed',
                args: {
                    executionId,
                    to: identity.address,
                    value: new web3.BigNumber(0),
                    data: addKeyData,
                },
            });
            logs.should.have.a.lengthOf(1);

            await assertKeyCount(identity, Purpose.ACTION, 4);
        });

        it('should add key only with management keys', async () => {
            await assertKeyCount(identity, Purpose.ACTION, 3);

            const addKeyData = await identity.contract.addKey.getData(
                accounts.action[3].key,
                Purpose.ACTION,
                KeyType.ECDSA,
            );
            await assertRevert(identity.execute(
                identity.address,
                0,
                addKeyData,
                { from: accounts.action[1].addr },
            ));

            const logs = await getEvents(identity, { event: 'ExecutionRequested' });
            logs.should.have.a.lengthOf(0);

            await assertKeyCount(identity, Purpose.ACTION, 3);
        });

        it('should remove key', async () => {
            await assertKeyCount(identity, Purpose.MANAGEMENT, 3);

            const removeKeyData = await identity.contract.removeKey.getData(
                accounts.manager[0].key,
                Purpose.MANAGEMENT,
            );
            await assertOkTx(identity.execute(
                identity.address,
                0,
                removeKeyData,
                { from: accounts.manager[1].addr },
            ));

            let logs = await getEvents(identity, {
                event: 'ExecutionRequested',
                args: {
                    to: identity.address,
                    value: new web3.BigNumber(0),
                    data: removeKeyData,
                },
            });
            logs.should.have.a.lengthOf(1);
            const { args: { executionId } } = logs[0];

            logs = await getEvents(identity, {
                event: 'Executed',
                args: {
                    executionId,
                    to: identity.address,
                    value: new web3.BigNumber(0),
                    data: removeKeyData,
                },
            });
            logs.should.have.a.lengthOf(1);

            await assertKeyCount(identity, Purpose.MANAGEMENT, 2);
        });

        it('should remove key only with management keys', async () => {
            await assertKeyCount(identity, Purpose.MANAGEMENT, 3);

            const removeKeyData = await identity.contract.removeKey.getData(
                accounts.manager[0].key,
                Purpose.MANAGEMENT,
            );
            await assertRevert(identity.execute(
                identity.address,
                0,
                removeKeyData,
                { from: accounts.action[1].addr },
            ));

            const logs = await getEvents(identity, { event: 'ExecutionRequested' });
            logs.should.have.a.lengthOf(0);

            await assertKeyCount(identity, Purpose.MANAGEMENT, 3);
        });
    });

    describe('Test - Execute external contract functions', async () => {
        it('other contract works', async () => {
            assert.equal(await otherContract.numCalls(accounts.action[1].addr), 0);

            await assertOkTx(otherContract.callMe({ from: accounts.action[1].addr }));

            assert.equal(await otherContract.numCalls(accounts.action[1].addr), 1);
        });

        it('should call other contracts with action keys', async () => {
            // Identity never called other contract
            assert.equal(await otherContract.numCalls(identity.address), 0);

            const callData = await otherContract.contract.callMe.getData();
            await assertOkTx(identity.execute(
                otherContract.address,
                0,
                callData,
                { from: accounts.action[1].addr },
            ));

            let logs = await getEvents(identity, {
                event: 'ExecutionRequested',
                args: {
                    to: otherContract.address,
                    value: new web3.BigNumber(0),
                    data: callData,
                },
            });
            logs.should.have.a.lengthOf(1);
            const { args: { executionId } } = logs[0];

            logs = await getEvents(identity, {
                event: 'Executed',
                args: {
                    executionId,
                    to: otherContract.address,
                    value: new web3.BigNumber(0),
                    data: callData,
                },
            });
            logs.should.have.a.lengthOf(1);

            // Identity called other contract
            assert.equal(await otherContract.numCalls(identity.address), 1);
        });

        it('should not call other contracts with management keys', async () => {
            assert.equal(await otherContract.numCalls(identity.address), 0);

            const callData = await otherContract.contract.callMe.getData();
            await assertRevert(identity.execute(
                otherContract.address,
                0,
                callData,
                { from: accounts.manager[1].addr },
            ));

            const logs = await getEvents(identity, { event: 'ExecutionRequested' });
            logs.should.have.a.lengthOf(0);

            assert.equal(await otherContract.numCalls(identity.address), 0);
        });
    });

    describe('Test - Require multiple signatures', async () => {
        it('can\'t overflow threshold', async () => {
            await assertRevert(identity.changeManagementThreshold(
                0,
                { from: accounts.manager[0].addr },
            ));
            await assertRevert(identity.changeManagementThreshold(
                10,
                { from: accounts.manager[1].addr },
            ));
            await assertRevert(identity.changeActionThreshold(
                0,
                { from: accounts.manager[0].addr },
            ));
            await assertRevert(identity.changeActionThreshold(
                15,
                { from: accounts.manager[1].addr },
            ));
        });

        it('can\'t call directly once threshold is set', async () => {
            // One manager increases the threshold
            await assertOkTx(identity.changeManagementThreshold(
                2,
                { from: accounts.manager[0].addr },
            ));

            // Can't call methods directly
            await assertRevert(identity.addKey(
                accounts.manager[3].key,
                Purpose.MANAGEMENT,
                KeyType.ECDSA,
                { from: accounts.manager[0].addr },
            ));
            await assertRevert(identity.removeKey(
                accounts.manager[2].key,
                Purpose.MANAGEMENT,
                { from: accounts.manager[0].addr },
            ));
        });

        it('needs two managers to add a key', async () => {
            // One manager increases the threshold
            await assertOkTx(identity.changeManagementThreshold(
                2,
                { from: accounts.manager[0].addr },
            ));

            // Only 3 managers
            await assertKeyCount(identity, Purpose.MANAGEMENT, 3);

            // Add a 4th manager
            const addKeyData = await identity.contract.addKey.getData(
                accounts.manager[3].key,
                Purpose.MANAGEMENT,
                KeyType.ECDSA,
            );
            await assertOkTx(identity.execute(
                identity.address,
                0,
                addKeyData,
                { from: accounts.manager[1].addr },
            ));

            let logs = await getEvents(identity, {
                event: 'ExecutionRequested',
                args: {
                    to: identity.address,
                    value: new web3.BigNumber(0),
                    data: addKeyData,
                },
            });
            logs.should.have.a.lengthOf(1);
            const { args: { executionId: id } } = logs[0];

            logs = await getEvents(identity, { event: 'Executed' });
            logs.should.have.a.lengthOf(0);

            // Still 3
            await assertKeyCount(identity, Purpose.MANAGEMENT, 3);

            // Double approve does nothing now
            await assertOkTx(identity.approve(
                id,
                true,
                { from: accounts.manager[1].addr },
            ));
            logs = await getEvents(identity, {
                event: 'Approved',
                args: {
                    executionId: id,
                    approved: true,
                },
            });
            logs.should.have.a.lengthOf(1);

            // Action keys can't approve
            await assertRevert(identity.approve(
                id,
                true,
                { from: accounts.action[1].addr },
            ));
            logs = await getEvents(identity, { event: 'Approved' });
            logs.should.have.a.lengthOf(0);

            // Other manager disapproves at first
            await assertOkTx(identity.approve(
                id,
                false,
                { from: accounts.manager[0].addr },
            ));
            logs = await getEvents(identity, {
                event: 'Approved',
                args: {
                    executionId: id,
                    approved: false,
                },
            });
            logs.should.have.a.lengthOf(1);

            // Still 3
            await assertKeyCount(identity, Purpose.MANAGEMENT, 3);

            // But then approves!
            await assertOkTx(identity.approve(
                id,
                true,
                { from: accounts.manager[0].addr },
            ));
            logs = await getEvents(identity, {
                event: 'Approved',
                args: {
                    executionId: id,
                    approved: true,
                },
            });
            logs.should.have.a.lengthOf(1);

            logs = await getEvents(identity, {
                event: 'Executed',
                args: {
                    executionId: id,
                    to: identity.address,
                    value: new web3.BigNumber(0),
                    data: addKeyData,
                },
            });
            logs.should.have.a.lengthOf(1);

            // 4 managers
            await assertKeyCount(identity, Purpose.MANAGEMENT, 4);

            // ID no longer exists
            await assertRevert(identity.approve(
                id,
                false,
                { from: accounts.manager[2].addr },
            ));
            logs = await getEvents(identity, { event: 'Approved' });
            logs.should.have.a.lengthOf(0);
        });

        it('needs three action keys to call other', async () => {
            // One manager increases the threshold
            await assertOkTx(identity.changeActionThreshold(
                3,
                { from: accounts.manager[1].addr },
            ));

            // No calls yet
            assert.equal(await otherContract.numCalls(identity.address), 0);

            // One action requested
            const callData = await otherContract.contract.callMe.getData();
            await assertOkTx(identity.execute(
                otherContract.address,
                0,
                callData,
                { from: accounts.action[1].addr },
            ));

            let logs = await getEvents(identity, {
                event: 'ExecutionRequested',
                args: {
                    to: otherContract.address,
                    value: new web3.BigNumber(0),
                    data: callData,
                },
            });
            logs.should.have.a.lengthOf(1);
            const { args: { executionId: id } } = logs[0];

            logs = await getEvents(identity, { event: 'Executed' });
            logs.should.have.a.lengthOf(0);

            // Still no calls
            assert.equal(await otherContract.numCalls(identity.address), 0);

            // Double approve does nothing now
            await assertOkTx(identity.approve(
                id,
                true,
                { from: accounts.action[1].addr },
            ));
            logs = await getEvents(identity, {
                event: 'Approved',
                args: {
                    executionId: id,
                    approved: true,
                },
            });
            logs.should.have.a.lengthOf(1);

            // Management keys can't approve
            await assertRevert(identity.approve(
                id,
                true,
                { from: accounts.manager[1].addr },
            ));
            logs = await getEvents(identity, { event: 'Approved' });
            logs.should.have.a.lengthOf(0);

            // Approve, disapprove, approve
            await assertOkTx(identity.approve(
                id,
                true,
                { from: accounts.action[0].addr },
            ));
            logs = await getEvents(identity, {
                event: 'Approved',
                args: {
                    executionId: id,
                    approved: true,
                },
            });
            logs.should.have.a.lengthOf(1);

            await assertOkTx(identity.approve(
                id,
                false,
                { from: accounts.action[0].addr },
            ));
            logs = await getEvents(identity, {
                event: 'Approved',
                args: {
                    executionId: id,
                    approved: false,
                },
            });
            logs.should.have.a.lengthOf(1);

            await assertOkTx(identity.approve(
                id,
                true,
                { from: accounts.action[0].addr },
            ));
            logs = await getEvents(identity, {
                event: 'Approved',
                args: {
                    executionId: id,
                    approved: true,
                },
            });
            logs.should.have.a.lengthOf(1);

            assert.equal(await otherContract.numCalls(identity.address), 0);

            // One more approval
            await assertOkTx(identity.approve(
                id,
                true,
                { from: accounts.action[2].addr },
            ));
            logs = await getEvents(identity, {
                event: 'Approved',
                args: {
                    executionId: id,
                    approved: true,
                },
            });
            logs.should.have.a.lengthOf(1);

            logs = await getEvents(identity, {
                event: 'Executed',
                args: {
                    executionId: id,
                    to: otherContract.address,
                    value: new web3.BigNumber(0),
                    data: callData,
                },
            });
            logs.should.have.a.lengthOf(1);

            // Call has been made!
            assert.equal(await otherContract.numCalls(identity.address), 1);

            // ID no longer exists
            await assertRevert(identity.approve(
                id,
                false,
                { from: accounts.action[1].addr },
            ));
            logs = await getEvents(identity, { event: 'Approved' });
            logs.should.have.a.lengthOf(0);
        });
    });

    // TODO: test ExecutionRequested, Executed, Approved
});
