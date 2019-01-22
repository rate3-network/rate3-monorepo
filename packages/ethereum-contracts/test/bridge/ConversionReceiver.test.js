import { BN, constants, expectEvent, time, shouldFail } from 'openzeppelin-test-helpers';
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
  .use(require('chai-bn')(BN))
  .should();

contract('ConversionReceiver Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity
        // "now" function interpreted by testrpc
        await time.advanceBlock();
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
        this.receiver = await ConversionReceiver.new(this.token.address, { from: owner });
    });

    describe('Test - request conversion', function() {
        it('request conversion without allowance should fail', async function() {
            await shouldFail.reverting.withMessage(this.receiver.requestConversion(new BN('1000'), addrToBytes32(STELLAR_ADDRESS), { from: alice }), 'Allowance should be set');
        });

        it('request conversion exceeding token balance should fail', async function() {
            await this.token.approve(this.receiver.address, new BN('1500'), { from: alice });
            await shouldFail.reverting.withMessage(this.receiver.requestConversion(new BN('1500'), addrToBytes32(STELLAR_ADDRESS), { from: alice }), 'Insufficient balance');
        });

        it('request conversion should pass if balance and allowance are right', async function() {
            await this.token.approve(this.receiver.address, new BN('1500'), { from: alice });
            await this.receiver.requestConversion(new BN('1000'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
        });

        it('request conversion event emitted', async function() {
            await this.token.approve(this.receiver.address, new BN('1500'), { from: alice });
            let { logs } = await this.receiver.requestConversion(new BN('400'), addrToBytes32(STELLAR_ADDRESS), { from: alice });

            const event1 = expectEvent.inLogs(logs, 'ConversionRequested', {
                ethAddress: alice,
                stellarAddress: addrToBytes32(STELLAR_ADDRESS),
            });
        })
    });

    describe('Test - reject conversion', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new BN('1500'), { from: alice });
            await this.receiver.requestConversion(new BN('500'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
            await this.receiver.requestConversion(new BN('500'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
        });

        it('only owner can reject conversion', async function() {
            await shouldFail.reverting(this.receiver.rejectConversion(0, { from: alice }));
            await this.receiver.rejectConversion(0, { from: owner });
        });

        it('only can reject open conversion', async function() {
            await this.receiver.rejectConversion(0, { from: owner });
            await shouldFail.reverting.withMessage(this.receiver.rejectConversion(0, { from: owner }), 'Conversion should be open');

            await this.receiver.acceptConversion(1, { from: owner });
            await shouldFail.reverting.withMessage(this.receiver.rejectConversion(1, { from: owner }), 'Conversion should be open');
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

            amount1.should.be.a.bignumber.equals(new BN(0));
            amount2.should.be.a.bignumber.equals(new BN('500'));
            amount3.should.be.a.bignumber.equals(new BN('1000'));
        });
    });

    describe('Test - accept conversion', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new BN('1500'), { from: alice });
            await this.receiver.requestConversion(new BN('500'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
            await this.receiver.requestConversion(new BN('500'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
        });

        it('only owner can accept conversion', async function() {
            await shouldFail.reverting(this.receiver.acceptConversion(0, { from: alice }));
            await this.receiver.acceptConversion(0, { from: owner });
        });

        it('only can accept open conversion', async function() {
            await this.receiver.rejectConversion(0, { from: owner });
            await shouldFail.reverting.withMessage(this.receiver.acceptConversion(0, { from: owner }), 'Conversion should be open');

            await this.receiver.acceptConversion(1, { from: owner });
            await shouldFail.reverting.withMessage(this.receiver.acceptConversion(1, { from: owner }), 'Conversion should be open');
        });

        it('accept conversion event emitted', async function() {
            let { logs } = await this.receiver.acceptConversion(0, { from: owner });

            const event1 = expectEvent.inLogs(logs, 'ConversionAccepted', {
                ethAddress: alice,
                stellarAddress: addrToBytes32(STELLAR_ADDRESS),
            });
        })
    });

    describe('Test - unlock conversion', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new BN('1500'), { from: alice });
            await this.receiver.requestConversion(new BN('500'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
            await this.receiver.requestConversion(new BN('500'), addrToBytes32(STELLAR_ADDRESS), { from: alice });
            await this.receiver.acceptConversion(0, { from: owner });
            await this.receiver.acceptConversion(1, { from: owner });
        });

        it('only owner can unlock conversion', async function() {
            await shouldFail.reverting(this.receiver.unlockConversion(new BN('500'), alice, addrToBytes32(STELLAR_ADDRESS), { from: alice }));
            await this.receiver.unlockConversion(new BN('500'), alice, addrToBytes32(STELLAR_ADDRESS), { from: owner });
        });

        it('only can unlock total converted tokens', async function() {
            // Unlock 1000 tokens that were already converted before
            await this.receiver.unlockConversion(new BN('700'), alice, addrToBytes32(STELLAR_ADDRESS), { from: owner });
            await this.receiver.unlockConversion(new BN('300'), alice, addrToBytes32(STELLAR_ADDRESS), { from: owner });

            // Only 1000 converted tokens in total, exceeded
            await shouldFail.reverting.withMessage(this.receiver.unlockConversion(new BN('500'), alice, addrToBytes32(STELLAR_ADDRESS), { from: owner }), 'Not enough tokens to convert');
        });

        it('unlock conversion event emitted', async function() {
            let { logs } =  await this.receiver.unlockConversion(new BN('300'), alice, addrToBytes32(STELLAR_ADDRESS), { from: owner });

            const event1 = expectEvent.inLogs(logs, 'ConversionUnlocked', {
                ethAddress: alice,
                stellarAddress: addrToBytes32(STELLAR_ADDRESS),
            });
        })
    });
});