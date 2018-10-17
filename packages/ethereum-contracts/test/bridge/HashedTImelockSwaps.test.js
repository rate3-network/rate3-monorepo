import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import { advanceBlock } from '../helpers/advanceToBlock';
import { assertRevert } from '../helpers/assertRevert';
import expectEvent from '../helpers/expectEvent';

const HashedTimelockSwaps = artifacts.require("./bridge/HashedTimelockSwaps.sol");

// Token to be used as conversion
const ModularToken = artifacts.require("./tokenization/ModularToken.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const RegistryModule = artifacts.require("./tokenization/modules/RegistryModule.sol");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

contract('HashedTimelockSwaps Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity
        // "now" function interpreted by testrpc
        await advanceBlock();
    });

    const [_, owner, alice, bob, ...rest] = accounts;

    // For testing purposes, obviously.
    const SWAPID = '0x6400000000000000000000000000000000000000000000000000000000000000';
    const PREIMAGE = 'thisisatestpreimage';
    const SHA256HASH = '0x07662D74703CB2C4B405459758E6237E84897FB526E4830740C98977F3632494';

    beforeEach(async function () {
        // Initialize token.
        this.token = await ModularToken.new({ from: owner });

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
        await this.token.mint(alice, new web3.BigNumber('1000e+18'), { from: owner });

        // Initialize ConversionReceiver
        this.swaps = await HashedTimelockSwaps.new({ from: owner });

        // Approve
        await this.token.approve(this.swaps.address, new web3.BigNumber('1500e+18'), { from: alice });
    });

    describe('Test - open swap', function() {
        it('swap ID should be unique', async function() {
            await this.swaps.open(SWAPID, new web3.BigNumber('500e+18'), this.token.address, bob, SHA256HASH, latestTime() + 86400, { from: alice });
            await assertRevert(this.swaps.open(SWAPID, new web3.BigNumber('500e+18'), this.token.address, bob, SHA256HASH, latestTime() + 86400, { from: alice }));
        });

        it('request swap exceeding allowance should fail', async function() {
            await this.token.approve(this.swaps.address, new web3.BigNumber(0), { from: alice });
            await assertRevert(this.swaps.open(SWAPID, new web3.BigNumber('500e+18'), this.token.address, bob, SHA256HASH, latestTime() + 86400, { from: alice }));
        });

        it('request swap exceeding token balance should fail', async function() {
            await assertRevert(this.swaps.open(SWAPID, new web3.BigNumber('1500e+18'), this.token.address, bob, SHA256HASH, latestTime() + 86400, { from: alice }));
        });

        it('request conversion should pass if balance and allowance are right', async function() {
            await this.swaps.open(SWAPID, new web3.BigNumber('1000e+18'), this.token.address, bob, SHA256HASH, latestTime() + 86400, { from: alice });
        });

        it('tokens should be taken from alice', async function() {
            let amount1 = await this.token.balanceOf(alice);

            await this.swaps.open(SWAPID, new web3.BigNumber('1000e+18'), this.token.address, bob, SHA256HASH, latestTime() + 86400, { from: alice });

            let amount2 = await this.token.balanceOf(alice);

            amount1.should.be.bignumber.equal(new web3.BigNumber('1000e+18'));
            amount2.should.be.bignumber.equal(new web3.BigNumber(0));
        });

        it('open swap event emitted', async function() {
            let { logs } = await this.swaps.open(100, new web3.BigNumber('1000e+18'), this.token.address, bob, SHA256HASH, latestTime() + 86400, { from: alice });

            const event1 = expectEvent.inLogs(logs, 'Open', {
                _swapID: '0x6400000000000000000000000000000000000000000000000000000000000000',
                _withdrawTrader: bob,
                _secretLock: SHA256HASH.toLowerCase(),
            });
        });
    });

    describe('Test - close swap', function() {
        beforeEach(async function () {
            await this.swaps.open(SWAPID, new web3.BigNumber('500e+18'), this.token.address, bob, SHA256HASH, latestTime() + 86400, { from: alice });
        });

        it('only can close open swaps', async function() {
            await assertRevert(this.swaps.close(666, PREIMAGE, { from: bob }));

            await this.swaps.close(SWAPID, PREIMAGE, { from: bob });
            await assertRevert(this.swaps.close(SWAPID, PREIMAGE, { from: bob }));
        });

        it('only can close with correct secret key', async function() {
            await assertRevert(this.swaps.close(SWAPID, 'random', { from: bob }));
        });

        it('tokens should be sent to bob', async function() {
            let amount1 = await this.token.balanceOf(bob);

            await this.swaps.close(SWAPID, PREIMAGE, { from: bob });

            let amount2 = await this.token.balanceOf(bob);

            amount1.should.be.bignumber.equal(new web3.BigNumber(0));
            amount2.should.be.bignumber.equal(new web3.BigNumber('500e+18'));
        });

        it('close swap event emitted', async function() {
            let { logs } = await this.swaps.close(SWAPID, PREIMAGE, { from: bob });

            const event1 = expectEvent.inLogs(logs, 'Close', {
                _swapID: '0x6400000000000000000000000000000000000000000000000000000000000000',
                _secretKey: web3.toHex(PREIMAGE),
            });
        });
    });

    describe('Test - expire swap', function() {
        beforeEach(async function () {
            await this.swaps.open(SWAPID, new web3.BigNumber('500e+18'), this.token.address, bob, SHA256HASH, latestTime() + 86400, { from: alice });
        });

        it('only can expire open and expirable swaps', async function() {
            await assertRevert(this.swaps.expire(666, { from: bob }));

            await assertRevert(this.swaps.expire(SWAPID, { from: bob }));

            increaseTimeTo(latestTime() + 87000);
            await this.swaps.expire(SWAPID, { from: bob });

            await assertRevert(this.swaps.expire(SWAPID, { from: bob }));
        });

        it('tokens should be refunded in expiration', async function() {
            let amount1 = await this.token.balanceOf(alice);

            increaseTimeTo(latestTime() + 87000);
            await this.swaps.expire(SWAPID, { from: bob });

            let amount2 = await this.token.balanceOf(alice);

            amount1.should.be.bignumber.equal(new web3.BigNumber('500e+18'));
            amount2.should.be.bignumber.equal(new web3.BigNumber('1000e+18'));
        });

        it('expire swap event emitted', async function() {
            increaseTimeTo(latestTime() + 87000);
            let { logs } = await this.swaps.expire(SWAPID, { from: bob });

            const event1 = expectEvent.inLogs(logs, 'Expire', {
                _swapID: '0x6400000000000000000000000000000000000000000000000000000000000000',
            });
        });
    });
});