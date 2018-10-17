import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import { advanceBlock } from '../helpers/advanceToBlock';
import { assertRevert } from '../helpers/assertRevert';
import expectEvent from '../helpers/expectEvent';

import { StrKey } from 'stellar-base';
import {
    addrToBytes32,
} from '../identity/base';

const ConversionReceiver = artifacts.require("./bridge/ConversionReceiver.sol");

// Token to be used as conversion
const ModularToken = artifacts.require("./tokenization/ModularToken.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const RegistryModule = artifacts.require("./tokenization/modules/RegistryModule.sol");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

contract('ConversionReceiver Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity
        // "now" function interpreted by testrpc
        await advanceBlock();
    });

    const [_, owner, alice, ...rest] = accounts;

    // For testing purposes, obviously.
    const STELLAR_PUBLICKEY = 'GDOLD5H3UWDJ6GSOERAIF4TBJ4WPCQTQBKCRHYTPYSVC4B3DAUAP77OL';
    const STELLAR_SECRET = 'SALZVKPAM3IQXFEDMHRXPBNHF46RDGDSZHNLVIOKNYTB5NVQVHOYRDU4';
    const STELLAR_ADDRESS = `0x${
        StrKey.decodeEd25519PublicKey(STELLAR_PUBLICKEY).toString('hex')
    }`;

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
        this.receiver = await ConversionReceiver.new(this.token.address, { from: owner });
    });

    describe('Test - request conversion', function() {
        it('request conversion without allowance should fail', async function() {
            await assertRevert(this.receiver.requestConversion(new web3.BigNumber('1000e+18'), addrToBytes32(STELLAR_ADDRESS), { from: alice }));
        });

        it('request conversion exceeding token balance should fail', async function() {
            await this.token.approve(this.receiver.address, new web3.BigNumber('1500e+18'), { from: alice });
            await assertRevert(this.receiver.requestConversion(new web3.BigNumber('1500e+18'), addrToBytes32(STELLAR_ADDRESS), { from: alice }));
        });

        it('request conversion should pass if balance and allowance are right', async function() {
            await this.token.approve(this.receiver.address, new web3.BigNumber('1500e+18'), { from: alice });
            await this.receiver.requestConversion(new web3.BigNumber('1000e+18'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
        });

        it('request conversion event emitted', async function() {
            await this.token.approve(this.receiver.address, new web3.BigNumber('1500e+18'), { from: alice });
            let { logs } = await this.receiver.requestConversion(new web3.BigNumber('400e+18'), STELLAR_ADDRESS, { from: alice });

            const event1 = expectEvent.inLogs(logs, 'ConversionRequested', {
                ethAddress: alice,
                stellarAddress: addrToBytes32(STELLAR_ADDRESS),
            });
        })
    });

    describe('Test - reject conversion', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new web3.BigNumber('1500e+18'), { from: alice });
            await this.receiver.requestConversion(new web3.BigNumber('500e+18'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
            await this.receiver.requestConversion(new web3.BigNumber('500e+18'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
        });

        it('only owner can reject conversion', async function() {
            await assertRevert(this.receiver.rejectConversion(0, { from: alice }));
            await this.receiver.rejectConversion(0, { from: owner });
        });

        it('only can reject open conversion', async function() {
            await this.receiver.rejectConversion(0, { from: owner });
            await assertRevert(this.receiver.rejectConversion(0, { from: owner }));

            await this.receiver.acceptConversion(1, { from: owner });
            await assertRevert(this.receiver.rejectConversion(1, { from: owner }));
        });

        it('reject conversion event emitted', async function() {
            let { logs } = await this.receiver.rejectConversion(0, { from: owner });

            const event1 = expectEvent.inLogs(logs, 'ConversionRejected', {
                ethAddress: alice,
                stellarAddress: addrToBytes32(STELLAR_ADDRESS),
            });
        })

        it('tokens should be refunded in rejection', async function() {
            let amount1 = await this.token.balanceOf(alice);
            await this.receiver.rejectConversion(0, { from: owner });

            let amount2 = await this.token.balanceOf(alice);
            await this.receiver.rejectConversion(1, { from: owner });

            let amount3 = await this.token.balanceOf(alice);

            amount1.should.be.bignumber.equal(new web3.BigNumber(0));
            amount2.should.be.bignumber.equal(new web3.BigNumber('500e+18'));
            amount3.should.be.bignumber.equal(new web3.BigNumber('1000e+18'));
        });
    });

    describe('Test - reject conversion', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new web3.BigNumber('1500e+18'), { from: alice });
            await this.receiver.requestConversion(new web3.BigNumber('500e+18'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
            await this.receiver.requestConversion(new web3.BigNumber('500e+18'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
        });

        it('only owner can reject conversion', async function() {
            await assertRevert(this.receiver.rejectConversion(0, { from: alice }));
            await this.receiver.rejectConversion(0, { from: owner });
        });

        it('only can reject open conversion', async function() {
            await this.receiver.rejectConversion(0, { from: owner });
            await assertRevert(this.receiver.rejectConversion(0, { from: owner }));

            await this.receiver.acceptConversion(1, { from: owner });
            await assertRevert(this.receiver.rejectConversion(1, { from: owner }));
        });

        it('reject conversion event emitted', async function() {
            let { logs } = await this.receiver.rejectConversion(0, { from: owner });

            const event1 = expectEvent.inLogs(logs, 'ConversionRejected', {
                ethAddress: alice,
                stellarAddress: addrToBytes32(STELLAR_ADDRESS),
            });
        })

        it('tokens should be refunded in rejection', async function() {
            let amount1 = await this.token.balanceOf(alice);
            await this.receiver.rejectConversion(0, { from: owner });

            let amount2 = await this.token.balanceOf(alice);
            await this.receiver.rejectConversion(1, { from: owner });

            let amount3 = await this.token.balanceOf(alice);

            amount1.should.be.bignumber.equal(new web3.BigNumber(0));
            amount2.should.be.bignumber.equal(new web3.BigNumber('500e+18'));
            amount3.should.be.bignumber.equal(new web3.BigNumber('1000e+18'));
        });
    });

    describe('Test - accept conversion', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new web3.BigNumber('1500e+18'), { from: alice });
            await this.receiver.requestConversion(new web3.BigNumber('500e+18'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
            await this.receiver.requestConversion(new web3.BigNumber('500e+18'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
        });

        it('only owner can accept conversion', async function() {
            await assertRevert(this.receiver.acceptConversion(0, { from: alice }));
            await this.receiver.acceptConversion(0, { from: owner });
        });

        it('only can accept open conversion', async function() {
            await this.receiver.rejectConversion(0, { from: owner });
            await assertRevert(this.receiver.acceptConversion(0, { from: owner }));

            await this.receiver.acceptConversion(1, { from: owner });
            await assertRevert(this.receiver.acceptConversion(1, { from: owner }));
        });

        it('accept conversion event emitted', async function() {
            let { logs } = await this.receiver.acceptConversion(0, { from: owner });

            const event1 = expectEvent.inLogs(logs, 'ConversionAccepted', {
                ethAddress: alice,
                stellarAddress: addrToBytes32(STELLAR_ADDRESS),
            });
        })

        // Tokens should be burnt on accept (?)
    });
});