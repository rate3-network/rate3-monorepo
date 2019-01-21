import { BN, constants, expectEvent, time, shouldFail } from 'openzeppelin-test-helpers';
const HashedTimelockSwaps = artifacts.require("./bridge/HashedTimelockSwaps.sol");

// Token to be used as conversion
const ModularToken = artifacts.require("./tokenization/ModularToken.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const RegistryModule = artifacts.require("./tokenization/modules/RegistryModule.sol");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract('HashedTimelockSwaps Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity
        // "now" function interpreted by testrpc
        await time.advanceBlock();
    });

    const [_, owner, alice, bob, ...rest] = accounts;

    // For testing purposes, obviously.
    const SWAPID = '0x6400000000000000000000000000000000000000000000000000000000000000';
    const SWAPID2 = '0x6500000000000000000000000000000000000000000000000000000000000000';
    const PREIMAGE = '0x7468697369736174657374707265696d616765';
    const WRONGPREIMAGE = '0x0';
    const SHA256HASH = '0x07662D74703CB2C4B405459758E6237E84897FB526E4830740C98977F3632494';

    beforeEach(async function () {
        // Initialize token.
        this.token = await ModularToken.new('BaseToken', 'BT', 18, { from: owner });

        this.balanceModule = await BalanceModule.new({ from: owner });
        this.allowanceModule = await AllowanceModule.new({ from: owner });
        this.registryModule = await RegistryModule.new({ from: owner });
        await this.balanceModule.transferOwnership(this.token.address, { from: owner });
        await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
        await this.registryModule.transferOwnership(this.token.address, { from: owner });
        await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
        await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
        await this.token.setRegistryModule(this.registryModule.address, { from: owner });

        // Mint some tokens for alice.
        await this.token.mint(alice, new BN('1000'), { from: owner });

        // Initialize ConversionReceiver
        this.swaps = await HashedTimelockSwaps.new({ from: owner });

        // Approve
        await this.token.approve(this.swaps.address, new BN('1500'), { from: alice });

        this.timelock = (await time.latest()).add(time.duration.days(1));
    });

    describe('Test - open swap', function() {
        it('swap ID should be unique', async function() {
            await this.swaps.open(SWAPID, new BN('500'), this.token.address, bob, SHA256HASH, this.timelock, { from: alice });
            await shouldFail.reverting.withMessage(this.swaps.open(SWAPID, new BN('500'), this.token.address, bob, SHA256HASH, this.timelock, { from: alice }), 'Swap should be invalid');
        });

        it('request swap exceeding allowance should fail', async function() {
            await this.token.approve(this.swaps.address, new BN(0), { from: alice });
            await shouldFail.reverting.withMessage(this.swaps.open(SWAPID, new BN('500'), this.token.address, bob, SHA256HASH, this.timelock, { from: alice }), 'Allowance should be set');
        });

        it('request swap exceeding token balance should fail', async function() {
            await shouldFail.reverting.withMessage(this.swaps.open(SWAPID, new BN('1500'), this.token.address, bob, SHA256HASH, this.timelock, { from: alice }), 'Insufficient balance');
        });

        it('request conversion should pass if balance and allowance are right', async function() {
            await this.swaps.open(SWAPID, new BN('1000'), this.token.address, bob, SHA256HASH, this.timelock, { from: alice });
        });

        it('tokens should be taken from alice', async function() {
            let amount1 = await this.token.balanceOf(alice);

            await this.swaps.open(SWAPID, new BN('1000'), this.token.address, bob, SHA256HASH, this.timelock, { from: alice });

            let amount2 = await this.token.balanceOf(alice);

            amount1.should.be.a.bignumber.equals(new BN('1000'));
            amount2.should.be.a.bignumber.equals(new BN(0));
        });

        it('open swap event emitted', async function() {
            let { logs } = await this.swaps.open(SWAPID, new BN('1000'), this.token.address, bob, SHA256HASH, this.timelock, { from: alice });

            const event1 = expectEvent.inLogs(logs, 'Open', {
                _swapID: SWAPID,
                _withdrawTrader: bob,
                _secretLock: SHA256HASH.toLowerCase(),
            });
        });
    });

    describe('Test - close swap', function() {
        beforeEach(async function () {
            await this.swaps.open(SWAPID, new BN('500'), this.token.address, bob, SHA256HASH, this.timelock, { from: alice });
        });

        it('only can close open swaps', async function() {
            await shouldFail.reverting.withMessage(this.swaps.close(SWAPID2, PREIMAGE, { from: bob }), 'Swap should be open');

            await this.swaps.close(SWAPID, PREIMAGE, { from: bob });
            await shouldFail.reverting.withMessage(this.swaps.close(SWAPID, PREIMAGE, { from: bob }), 'Swap should be open');
        });

        it('only can close with correct secret key', async function() {
            await shouldFail.reverting.withMessage(this.swaps.close(SWAPID, WRONGPREIMAGE, { from: bob }), 'Secret key invalid');
        });

        it('tokens should be sent to bob', async function() {
            let amount1 = await this.token.balanceOf(bob);

            await this.swaps.close(SWAPID, PREIMAGE, { from: bob });

            let amount2 = await this.token.balanceOf(bob);

            amount1.should.be.a.bignumber.equals(new BN(0));
            amount2.should.be.a.bignumber.equals(new BN('500'));
        });

        it('close swap event emitted', async function() {
            let { logs } = await this.swaps.close(SWAPID, PREIMAGE, { from: bob });

            const event1 = expectEvent.inLogs(logs, 'Close', {
                _swapID: '0x6400000000000000000000000000000000000000000000000000000000000000',
                _secretKey: PREIMAGE,
            });
        });
    });

    describe('Test - expire swap', function() {
        beforeEach(async function () {
            await this.swaps.open(SWAPID, new BN('500'), this.token.address, bob, SHA256HASH, this.timelock, { from: alice });
        });

        it('only can expire open and expirable swaps', async function() {
            await shouldFail.reverting.withMessage(this.swaps.expire(SWAPID2, { from: bob }), 'Swap should be open');

            await shouldFail.reverting.withMessage(this.swaps.expire(SWAPID, { from: bob }), 'Swap is not yet expired');

            await time.increaseTo(this.timelock.add(time.duration.hours(1)));
            await this.swaps.expire(SWAPID, { from: bob });

            await shouldFail.reverting.withMessage(this.swaps.expire(SWAPID, { from: bob }));
        });

        it('tokens should be refunded in expiration', async function() {
            let amount1 = await this.token.balanceOf(alice);

            await time.increaseTo(this.timelock.add(time.duration.hours(1)));
            await this.swaps.expire(SWAPID, { from: bob });

            let amount2 = await this.token.balanceOf(alice);

            amount1.should.be.a.bignumber.equals(new BN('500'));
            amount2.should.be.a.bignumber.equals(new BN('1000'));
        });

        it('expire swap event emitted', async function() {
            await time.increaseTo(this.timelock.add(time.duration.hours(1)));
            let { logs } = await this.swaps.expire(SWAPID, { from: bob });

            const event1 = expectEvent.inLogs(logs, 'Expire', {
                _swapID: '0x6400000000000000000000000000000000000000000000000000000000000000',
            });
        });
    });
});