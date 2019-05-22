import { BN, constants, expectEvent, time, shouldFail } from 'openzeppelin-test-helpers';

const ConversionReceiver = artifacts.require("./bridge/IOSTConversionReceiver.sol");

// Token to be used as conversion
const ModularToken = artifacts.require("./tokenization/ModularToken.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const RegistryModule = artifacts.require("./tokenization/modules/RegistryModule.sol");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract('IOSTConversionReceiver Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity
        // "now" function interpreted by testrpc
        await time.advanceBlock();
    });

    const [_, owner, alice, feeWallet, coldWallet, ...rest] = accounts;

    // IOST account names has 5-11 characters, [a-z0-9_].
    const IOST_ACCOUNT = 'demoaccount';
    const IOST_TX_HASH = '2GUFzWbxSWMLSwwpzj1uVz2ARtLCkVawYHECNc9fhVkZ';
    const MINIMUM_THRESHOLD_TOKENS = new BN('1000000000000000000000'); // 1000 RTE tokens
    const MINIMUM_TOKENS = new BN('1000000000000000000'); // 1 token

    beforeEach(async function () {
        // Initialize main token for conversion.
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

        // Initialize RTE utility token for discount.
        this.rteToken = await ModularToken.new('Rate3', 'RTE', 18, { from: owner });

        this.rteBalanceModule = await BalanceModule.new({ from: owner });
        this.rteAllowanceModule = await AllowanceModule.new({ from: owner });
        this.rteRegistryModule = await RegistryModule.new({ from: owner });
        await this.rteBalanceModule.transferOwnership(this.rteToken.address, { from: owner });
        await this.rteAllowanceModule.transferOwnership(this.rteToken.address, { from: owner });
        await this.rteRegistryModule.transferOwnership(this.rteToken.address, { from: owner });
        await this.rteToken.setAllowanceModule(this.rteAllowanceModule.address, { from: owner });
        await this.rteToken.setBalanceModule(this.rteBalanceModule.address, { from: owner });
        await this.rteToken.setRegistryModule(this.rteRegistryModule.address, { from: owner });

        // Mint 1000 tokens for alice.
        await this.token.mint(alice, new BN('1000000000000000000000'), { from: owner });
        
        // Initialize ConversionReceiver
        this.receiver = await ConversionReceiver.new(
            this.token.address,
            this.rteToken.address,
            MINIMUM_THRESHOLD_TOKENS,
            5,
            10,
            0,
            5,
            MINIMUM_TOKENS,
            feeWallet,
            coldWallet,
            { from: owner }
        );
    });

    describe('Test - owner functions', function() {
        beforeEach(async function () {
            await this.receiver.pause({ from: owner });
        });

        it('only owner can call admin functions', async function() {
            await shouldFail.reverting(this.receiver.setDiscountToken(constants.ZERO_ADDRESS, { from: alice }));
            await shouldFail.reverting(this.receiver.setDiscountThreshold(MINIMUM_THRESHOLD_TOKENS, { from: alice }));
            await shouldFail.reverting(this.receiver.setConversionFeeBasisPoints(0, { from: alice }));
            await shouldFail.reverting(this.receiver.setUnlockFeeBasisPoints(0, { from: alice }));
            await shouldFail.reverting(this.receiver.setDiscountedConversionFeeBasisPoints(0, { from: alice }));
            await shouldFail.reverting(this.receiver.setDiscountedUnlockFeeBasisPoints(0, { from: alice }));
            await shouldFail.reverting(this.receiver.setMinimumConversionAmount(MINIMUM_TOKENS, { from: alice }));
            await shouldFail.reverting(this.receiver.setFeeCollectionWallet(feeWallet, { from: alice }));
            await shouldFail.reverting(this.receiver.setColdStorageWallet(coldWallet, { from: alice }));
        });

        it('only callable when paused', async function() {
            await this.receiver.unpause({ from: owner });
            await shouldFail.reverting(this.receiver.setDiscountToken(constants.ZERO_ADDRESS, { from: owner }));
            await shouldFail.reverting(this.receiver.setDiscountThreshold(MINIMUM_THRESHOLD_TOKENS, { from: owner }));
            await shouldFail.reverting(this.receiver.setConversionFeeBasisPoints(0, { from: owner }));
            await shouldFail.reverting(this.receiver.setUnlockFeeBasisPoints(0, { from: owner }));
            await shouldFail.reverting(this.receiver.setDiscountedConversionFeeBasisPoints(0, { from: owner }));
            await shouldFail.reverting(this.receiver.setDiscountedUnlockFeeBasisPoints(0, { from: owner }));
            await shouldFail.reverting(this.receiver.setMinimumConversionAmount(MINIMUM_TOKENS, { from: owner }));
            await shouldFail.reverting(this.receiver.setFeeCollectionWallet(feeWallet, { from: owner }));
            await shouldFail.reverting(this.receiver.setColdStorageWallet(coldWallet, { from: owner }));
        });

        it('check fields updated correctly', async function() {
            await this.receiver.setDiscountToken(constants.ZERO_ADDRESS, { from: owner });
            await this.receiver.setDiscountThreshold(1, { from: owner });
            await this.receiver.setConversionFeeBasisPoints(3, { from: owner });
            await this.receiver.setUnlockFeeBasisPoints(4, { from: owner });
            await this.receiver.setDiscountedConversionFeeBasisPoints(1, { from: owner });
            await this.receiver.setDiscountedUnlockFeeBasisPoints(2, { from: owner });
            await this.receiver.setMinimumConversionAmount(1, { from: owner });
            await this.receiver.setFeeCollectionWallet(constants.ZERO_ADDRESS, { from: owner });
            await this.receiver.setColdStorageWallet(constants.ZERO_ADDRESS, { from: owner });

            (await this.receiver.discountToken()).should.be.equal(constants.ZERO_ADDRESS);
            (await this.receiver.discountThreshold()).should.be.a.bignumber.equals(new BN(1));
            (await this.receiver.conversionFeeBasisPoints()).should.be.a.bignumber.equals(new BN(3));
            (await this.receiver.unlockFeeBasisPoints()).should.be.a.bignumber.equals(new BN(4));
            (await this.receiver.discountedConversionFeeBasisPoints()).should.be.a.bignumber.equals(new BN(1));
            (await this.receiver.discountedUnlockFeeBasisPoints()).should.be.a.bignumber.equals(new BN(2));
            (await this.receiver.minimumConversionAmount()).should.be.a.bignumber.equals(new BN(1));
            (await this.receiver.feeCollectionWallet()).should.be.equal(constants.ZERO_ADDRESS);
            (await this.receiver.coldStorageWallet()).should.be.equal(constants.ZERO_ADDRESS);
        });
    });

    describe('Test - collect fees', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new BN('1500000000000000000000'), { from: alice });
            // Split 500 tokens into 2 conversion requests
            await this.receiver.requestConversion(new BN('500000000000000000000'), IOST_ACCOUNT, { from: alice });
            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS, { from: owner });
            await this.receiver.requestConversion(new BN('500000000000000000000'), IOST_ACCOUNT, { from: alice });

            await this.receiver.acceptConversion(0, { from: owner });
            await this.receiver.acceptConversion(1, { from: owner });
        });

        it('only owner can collect fees', async function() {
            await shouldFail.reverting(this.receiver.collectFees({ from: alice }));
            await this.receiver.collectFees({ from: owner });
        });

        it('check fees updated correctly', async function() {
            await this.receiver.collectFees({ from: owner });
            let amount1 = await this.receiver.fees();            

            amount1.should.be.a.bignumber.equals(new BN(0));
        });

        it('check fees transferred', async function() {
            let amount1 = await this.receiver.fees();         
            await this.receiver.collectFees({ from: owner });
            let amount2 = await this.token.balanceOf(feeWallet);

            amount2.should.be.a.bignumber.equals(amount1);
        });

        it('collected fees event emitted', async function() {
            let amount1 = await this.receiver.fees();         
            let { logs } = await this.receiver.collectFees({ from: owner });

            const event1 = expectEvent.inLogs(logs, 'CollectedFees', {
                feeCollectionWallet: feeWallet,
                amount: amount1,
            });
        })
    });

    describe('Test - send to cold storage', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new BN('1500000000000000000000'), { from: alice });
            // Split 500 tokens into 2 conversion requests
            await this.receiver.requestConversion(new BN('500000000000000000000'), IOST_ACCOUNT, { from: alice });
            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS, { from: owner });
            await this.receiver.requestConversion(new BN('500000000000000000000'), IOST_ACCOUNT, { from: alice });

            await this.receiver.acceptConversion(0, { from: owner });
            await this.receiver.acceptConversion(1, { from: owner });

            await this.receiver.pause({ from: owner });
        });

        it('only callable when paused', async function() {
            await this.receiver.unpause({ from: owner });
            await shouldFail.reverting(this.receiver.sendTokensToColdStorage(new BN('500000000000000000000'), { from: owner }));
            await this.receiver.pause({ from: owner });
            await this.receiver.sendTokensToColdStorage(new BN('500000000000000000000'), { from: owner });
        });

        it('only owner send tokens to cold storage', async function() {
            await shouldFail.reverting(this.receiver.sendTokensToColdStorage(new BN('500000000000000000000'), { from: alice }));
            await this.receiver.sendTokensToColdStorage(new BN('500000000000000000000'), { from: owner });
        });

        it('check tokens transferred', async function() {
            let amount1 = await this.token.balanceOf(this.receiver.address);        
            await this.receiver.sendTokensToColdStorage(new BN('300000000000000000000'), { from: owner });
            let amount2 = await this.token.balanceOf(this.receiver.address);
            let amount3 = await this.token.balanceOf(coldWallet);

            amount1.should.be.a.bignumber.equals(new BN('1000000000000000000000'));
            amount2.should.be.a.bignumber.equals(new BN('700000000000000000000'));
            amount3.should.be.a.bignumber.equals(new BN('300000000000000000000'));
        });

        it('cold storage event emitted', async function() {
            const { logs } = await this.receiver.sendTokensToColdStorage(new BN('300000000000000000000'), { from: owner });

            const event1 = expectEvent.inLogs(logs, 'SentTokensToColdStorage', {
                coldStorageWallet: coldWallet,
                amount: new BN('300000000000000000000'),
            });
        })
    });

    describe('Test - request conversion', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new BN('1500000000000000000000'), { from: alice });
        });

        it('request conversion without allowance should fail', async function() {
            await this.token.approve(this.receiver.address, new BN('0'), { from: alice });
            await shouldFail.reverting.withMessage(this.receiver.requestConversion(MINIMUM_TOKENS, IOST_ACCOUNT, { from: alice }), 'Allowance should be set');
        });

        it('request conversion exceeding token balance should fail', async function() {
            await shouldFail.reverting(this.receiver.requestConversion(new BN('1500000000000000000000'), IOST_ACCOUNT, { from: alice }));
        });

        it('request conversion should pass if balance and allowance are right', async function() {
            await this.receiver.requestConversion(new BN('1000000000000000000000'), IOST_ACCOUNT, { from: alice });
        });

        it('request conversion must be higher than minimum amount', async function() {
            await shouldFail.reverting.withMessage(this.receiver.requestConversion(MINIMUM_TOKENS.sub(new BN('1')), IOST_ACCOUNT, { from: alice }), 'Should be above minimum conversion amount');
            await this.receiver.requestConversion(MINIMUM_TOKENS, IOST_ACCOUNT, { from: alice });
        });

        it('tokens should be transferred to contract on request', async function() {
            let amount1 = await this.token.balanceOf(alice);
            await this.receiver.requestConversion(new BN('1000000000000000000000'), IOST_ACCOUNT, { from: alice });
            let amount2 = await this.token.balanceOf(alice);

            amount1.should.be.a.bignumber.equals(new BN('1000000000000000000000'));
            amount2.should.be.a.bignumber.equals(new BN(0));
        });

        it('request conversion event emitted', async function() {
            let { logs } = await this.receiver.requestConversion(new BN('1000000000000000000000'), IOST_ACCOUNT, { from: alice });

            const event1 = expectEvent.inLogs(logs, 'ConversionRequested', {
                indexID: new BN('0'),
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                amount: new BN('1000000000000000000000'),
                fee: new BN('1000000000000000000000').mul(new BN(5)).div(new BN(10000)),
                netAmount: new BN('1000000000000000000000').sub(new BN('1000000000000000000000').mul(new BN(5)).div(new BN(10000))),
                discounted: false,
            });
        });

        it('request conversion no discount if user does not have minimum discount tokens', async function() {
            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS.sub(new BN(1)), { from: owner });

            let { logs } = await this.receiver.requestConversion(new BN('1000000000000000000000'), IOST_ACCOUNT, { from: alice });

            const event1 = expectEvent.inLogs(logs, 'ConversionRequested', {
                indexID: new BN('0'),
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                amount: new BN('1000000000000000000000'),
                fee: new BN('1000000000000000000000').mul(new BN(5)).div(new BN(10000)),
                netAmount: new BN('1000000000000000000000').sub(new BN('1000000000000000000000').mul(new BN(5)).div(new BN(10000))),
                discounted: false,
            });
        });

        it('request conversion discount if user have minimum discount tokens', async function() {
            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS, { from: owner });

            let { logs } = await this.receiver.requestConversion(new BN('1000000000000000000000'), IOST_ACCOUNT, { from: alice });

            const event1 = expectEvent.inLogs(logs, 'ConversionRequested', {
                indexID: new BN('0'),
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                amount: new BN('1000000000000000000000'),
                fee: new BN(0),
                netAmount: new BN('1000000000000000000000'),
                discounted: true,
            });
        });
    });

    describe('Test - reject conversion', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new BN('1500000000000000000000'), { from: alice });
            // Split 500 tokens into 2 conversion requests
            await this.receiver.requestConversion(new BN('500000000000000000000'), IOST_ACCOUNT, { from: alice });
            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS, { from: owner });
            await this.receiver.requestConversion(new BN('500000000000000000000'), IOST_ACCOUNT, { from: alice });
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

        it('tokens should be refunded in rejection', async function() {
            let amount1 = await this.token.balanceOf(alice);
            await this.receiver.rejectConversion(0, { from: owner });

            let amount2 = await this.token.balanceOf(alice);
            await this.receiver.rejectConversion(1, { from: owner });

            let amount3 = await this.token.balanceOf(alice);

            amount1.should.be.a.bignumber.equals(new BN(0));
            amount2.should.be.a.bignumber.equals(new BN('500000000000000000000'));
            amount3.should.be.a.bignumber.equals(new BN('1000000000000000000000'));
        });

        it('reject conversion event emitted', async function() {
            let { logs } = await this.receiver.rejectConversion(0, { from: owner });

            const event1 = expectEvent.inLogs(logs, 'ConversionRejected', {
                indexID: new BN('0'),
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                amount: new BN('500000000000000000000'),
                fee: new BN('500000000000000000000').mul(new BN(5)).div(new BN(10000)),
                netAmount: new BN('500000000000000000000').sub(new BN('500000000000000000000').mul(new BN(5)).div(new BN(10000))),
                discounted: false,
            });

            let { logs: logs2 } = await this.receiver.rejectConversion(1, { from: owner });

            const event2 = expectEvent.inLogs(logs2, 'ConversionRejected', {
                indexID: new BN('1'),
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                amount: new BN('500000000000000000000'),
                fee: new BN('0'),
                netAmount: new BN('500000000000000000000'),
                discounted: true,
            });
        });
    });

    describe('Test - accept conversion', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new BN('1500000000000000000000'), { from: alice });
            // Split 500 tokens into 2 conversion requests
            await this.receiver.requestConversion(new BN('500000000000000000000'), IOST_ACCOUNT, { from: alice });
            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS, { from: owner });
            await this.receiver.requestConversion(new BN('500000000000000000000'), IOST_ACCOUNT, { from: alice });
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

        it('check fees updated correctly', async function() {
            let amount1 = await this.receiver.fees();
            await this.receiver.acceptConversion(0, { from: owner });
            let amount2 = await this.receiver.fees();
            await this.receiver.acceptConversion(1, { from: owner });
            let amount3 = await this.receiver.fees();

            amount1.should.be.a.bignumber.equals(new BN(0));
            amount2.should.be.a.bignumber.equals(new BN('500000000000000000000').mul(new BN(5)).div(new BN(10000)));
            amount3.should.be.a.bignumber.equals(new BN('500000000000000000000').mul(new BN(5)).div(new BN(10000)));
        });

        it('total locked tokens updated correctly', async function() {
            let amount1 = await this.receiver.totalLockedTokens();
            await this.receiver.acceptConversion(0, { from: owner });
            let amount2 = await this.receiver.totalLockedTokens();
            await this.receiver.acceptConversion(1, { from: owner });
            let amount3 = await this.receiver.totalLockedTokens();

            amount1.should.be.a.bignumber.equals(new BN(0));
            amount2.should.be.a.bignumber.equals(new BN('500000000000000000000').sub(new BN('500000000000000000000').mul(new BN(5)).div(new BN(10000))));
            amount3.should.be.a.bignumber.equals(amount2.add(new BN('500000000000000000000')));
        });

        it('accept conversion event emitted', async function() {
            let { logs } = await this.receiver.acceptConversion(0, { from: owner });

            const event1 = expectEvent.inLogs(logs, 'ConversionAccepted', {
                indexID: new BN('0'),
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                amount: new BN('500000000000000000000'),
                fee: new BN('500000000000000000000').mul(new BN(5)).div(new BN(10000)),
                netAmount: new BN('500000000000000000000').sub(new BN('500000000000000000000').mul(new BN(5)).div(new BN(10000))),
                discounted: false,
            });

            let { logs: logs2 } = await this.receiver.acceptConversion(1, { from: owner });

            const event2 = expectEvent.inLogs(logs2, 'ConversionAccepted', {
                indexID: new BN('1'),
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                amount: new BN('500000000000000000000'),
                fee: new BN('0'),
                netAmount: new BN('500000000000000000000'),
                discounted: true,
            });
        })
    });

    describe('Test - request conversion unlock', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new BN('1000000000000000000000'), { from: alice });
            // Split 500 tokens into 2 conversion requests
            await this.receiver.requestConversion(new BN('400000000000000000000'), IOST_ACCOUNT, { from: alice });
            await this.receiver.requestConversion(new BN('400000000000000000000'), IOST_ACCOUNT, { from: alice });

            await this.receiver.acceptConversion(0, { from: owner });
            await this.receiver.acceptConversion(1, { from: owner });
        });

        it('request conversion unlock exceeding token balance should fail', async function() {
            await shouldFail.reverting.withMessage(
                this.receiver.requestConversionUnlock(
                    new BN('1000000000000000000000'),
                    IOST_ACCOUNT,
                    IOST_TX_HASH,
                    { from: alice }
                ),
                'Not enough tokens to convert'
            );
        });

        it('request conversion unlock should pass if balance is right', async function() {
            await this.receiver.requestConversionUnlock(new BN('400000000000000000000'), IOST_ACCOUNT, IOST_TX_HASH, { from: alice });
        });

        it('request conversion unlock must be higher than minimum amount', async function() {
            await shouldFail.reverting.withMessage(
                this.receiver.requestConversionUnlock(
                    MINIMUM_TOKENS.sub(new BN('1')),
                    IOST_ACCOUNT,
                    IOST_TX_HASH,
                    { from: alice }
                ),
                'Should be above minimum conversion amount'
            );
            await this.receiver.requestConversionUnlock(MINIMUM_TOKENS, IOST_ACCOUNT, IOST_TX_HASH, { from: alice });
        });

        it('request conversion unlock event emitted', async function() {
            let { logs } = await this.receiver.requestConversionUnlock(new BN('400000000000000000000'), IOST_ACCOUNT, IOST_TX_HASH, { from: alice });

            const event1 = expectEvent.inLogs(logs, 'ConversionUnlockRequested', {
                indexID: new BN('0'),
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                iostMirrorTransactionHash: IOST_TX_HASH,
                amount: new BN('400000000000000000000'),
                fee: new BN('400000000000000000000').mul(new BN(10)).div(new BN(10000)),
                netAmount: new BN('400000000000000000000').sub(new BN('400000000000000000000').mul(new BN(10)).div(new BN(10000))),
                discounted: false,
            });
        });

        it('request conversion no discount if user does not have minimum discount tokens', async function() {
            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS.sub(new BN(1)), { from: owner });

            let { logs } = await this.receiver.requestConversionUnlock(new BN('400000000000000000000'), IOST_ACCOUNT, IOST_TX_HASH, { from: alice });

            const event1 = expectEvent.inLogs(logs, 'ConversionUnlockRequested', {
                indexID: new BN('0'),
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                iostMirrorTransactionHash: IOST_TX_HASH,
                amount: new BN('400000000000000000000'),
                fee: new BN('400000000000000000000').mul(new BN(10)).div(new BN(10000)),
                netAmount: new BN('400000000000000000000').sub(new BN('400000000000000000000').mul(new BN(10)).div(new BN(10000))),
                discounted: false,
            });
        });

        it('request conversion discount if user have minimum discount tokens', async function() {
            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS, { from: owner });

            let { logs } = await this.receiver.requestConversionUnlock(new BN('400000000000000000000'), IOST_ACCOUNT, IOST_TX_HASH, { from: alice });

            const event1 = expectEvent.inLogs(logs, 'ConversionUnlockRequested', {
                indexID: new BN('0'),
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                amount: new BN('400000000000000000000'),
                fee: new BN('400000000000000000000').mul(new BN(5)).div(new BN(10000)),
                netAmount: new BN('400000000000000000000').sub(new BN('400000000000000000000').mul(new BN(5)).div(new BN(10000))),
                discounted: true,
            });
        });
    });

    describe('Test - reject conversion unlock', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new BN('1000000000000000000000'), { from: alice });
            // Split 500 tokens into 2 conversion requests
            await this.receiver.requestConversion(new BN('500000000000000000000'), IOST_ACCOUNT, { from: alice });
            await this.receiver.requestConversion(new BN('500000000000000000000'), IOST_ACCOUNT, { from: alice });

            await this.receiver.acceptConversion(0, { from: owner });
            await this.receiver.acceptConversion(1, { from: owner });

            await this.receiver.requestConversionUnlock(new BN('400000000000000000000'), IOST_ACCOUNT, IOST_TX_HASH, { from: alice });
            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS, { from: owner });
            await this.receiver.requestConversionUnlock(new BN('400000000000000000000'), IOST_ACCOUNT, IOST_TX_HASH, { from: alice });
        });

        it('only owner can reject conversion unlock', async function() {
            await shouldFail.reverting(this.receiver.rejectConversionUnlock(0, { from: alice }));
            this.receiver.rejectConversionUnlock(0, { from: owner });
        });

        it('only can reject open conversion unlock', async function() {
            await this.receiver.rejectConversionUnlock(0, { from: owner });
            await shouldFail.reverting.withMessage(this.receiver.rejectConversionUnlock(0, { from: owner }), 'ConversionUnlock should be open');

            await this.receiver.acceptConversionUnlock(1, { from: owner });
            await shouldFail.reverting.withMessage(this.receiver.rejectConversionUnlock(1, { from: owner }), 'ConversionUnlock should be open');
        });

        it('reject conversion unlock event emitted', async function() {
            let { logs } = await this.receiver.rejectConversionUnlock(0, { from: owner });

            const event1 = expectEvent.inLogs(logs, 'ConversionUnlockRejected', {
                indexID: new BN('0'),
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                iostMirrorTransactionHash: IOST_TX_HASH,
                amount: new BN('400000000000000000000'),
                fee: new BN('400000000000000000000').mul(new BN(10)).div(new BN(10000)),
                netAmount: new BN('400000000000000000000').sub(new BN('400000000000000000000').mul(new BN(10)).div(new BN(10000))),
                discounted: false,
            });

            let { logs: logs2 } = await this.receiver.rejectConversionUnlock(1, { from: owner });

            const event2 = expectEvent.inLogs(logs2, 'ConversionUnlockRejected', {
                indexID: new BN('1'),
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                iostMirrorTransactionHash: IOST_TX_HASH,
                amount: new BN('400000000000000000000'),
                fee: new BN('400000000000000000000').mul(new BN(5)).div(new BN(10000)),
                netAmount: new BN('400000000000000000000').sub(new BN('400000000000000000000').mul(new BN(5)).div(new BN(10000))),
                discounted: true,
            });
        });
    });


    describe('Test - accept conversion unlock', function() {
        beforeEach(async function () {
            await this.token.approve(this.receiver.address, new BN('1000000000000000000000'), { from: alice });
            // Split 500 tokens into 2 conversion requests
            await this.receiver.requestConversion(new BN('500000000000000000000'), IOST_ACCOUNT, { from: alice });
            await this.receiver.requestConversion(new BN('500000000000000000000'), IOST_ACCOUNT, { from: alice });

            await this.receiver.acceptConversion(0, { from: owner });
            await this.receiver.acceptConversion(1, { from: owner });

            await this.receiver.requestConversionUnlock(new BN('400000000000000000000'), IOST_ACCOUNT, IOST_TX_HASH, { from: alice });
            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS, { from: owner });
            await this.receiver.requestConversionUnlock(new BN('400000000000000000000'), IOST_ACCOUNT, IOST_TX_HASH, { from: alice });
        });

        it('only owner can accept conversion unlock', async function() {
            await shouldFail.reverting(this.receiver.acceptConversionUnlock(0, { from: alice }));
            await this.receiver.acceptConversionUnlock(0, { from: owner });
        });

        it('only can accept open conversion', async function() {
            await this.receiver.rejectConversionUnlock(0, { from: owner });
            await shouldFail.reverting.withMessage(this.receiver.acceptConversionUnlock(0, { from: owner }), 'ConversionUnlock should be open');

            await this.receiver.acceptConversionUnlock(1, { from: owner });
            await shouldFail.reverting.withMessage(this.receiver.acceptConversionUnlock(1, { from: owner }), 'ConversionUnlock should be open');
        });

        it('only can unlock total converted tokens', async function() {
            // Unlock 900 out of 999 (some % is funneled into fees) tokens that were already converted before
            await this.receiver.requestConversionUnlock(new BN('900000000000000000000'), IOST_ACCOUNT, IOST_TX_HASH, { from: owner });
            await this.receiver.acceptConversionUnlock(2, { from: owner });
        
            // Only 1000 converted tokens in total, exceeded
            await shouldFail.reverting.withMessage(this.receiver.acceptConversionUnlock(0, { from: owner }), 'Not enough tokens to convert');
            await shouldFail.reverting.withMessage(this.receiver.acceptConversionUnlock(1, { from: owner }), 'Not enough tokens to convert');
        });
     
        it('check fees updated correctly', async function() {
            let amount1 = await this.receiver.fees();
        
            await this.receiver.acceptConversionUnlock(0, { from: owner });
            let amount2 = await this.receiver.fees();
        
            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS, { from: owner });
        
            await this.receiver.acceptConversionUnlock(1, { from: owner });
            let amount3 = await this.receiver.fees();
        
            amount2.should.be.a.bignumber.equals(amount1.add(new BN('400000000000000000000').mul(new BN(10)).div(new BN(10000))));
            amount3.should.be.a.bignumber.equals(amount2.add(new BN('400000000000000000000').mul(new BN(5)).div(new BN(10000))));
        });

        it('total locked tokens updated correctly', async function() {
            let amount1 = await this.receiver.totalLockedTokens();

            await this.receiver.acceptConversionUnlock(0, { from: owner });
            let amount2 = await this.receiver.totalLockedTokens();

            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS, { from: owner });

            await this.receiver.acceptConversionUnlock(1, { from: owner });
            let amount3 = await this.receiver.totalLockedTokens();

            amount2.should.be.a.bignumber.equals(amount1.sub(new BN('400000000000000000000')));
            amount3.should.be.a.bignumber.equals(amount2.sub(new BN('400000000000000000000')));
        });

        it('tokens should be transferred to destination on accept', async function() {
            let amount1 = await this.token.balanceOf(alice);
            await this.receiver.acceptConversionUnlock(0, { from: owner });
            let amount2 = await this.token.balanceOf(alice);
            amount2.should.be.a.bignumber.equals(amount1.add(new BN('400000000000000000000').sub(new BN('400000000000000000000').mul(new BN(10)).div(new BN(10000)))));
        
            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS, { from: owner });
        
            await this.receiver.acceptConversionUnlock(1, { from: owner });
            let amount3 = await this.token.balanceOf(alice);
            amount3.should.be.a.bignumber.equals(amount2.add( new BN('400000000000000000000').sub(new BN('400000000000000000000').mul(new BN(5)).div(new BN(10000)))));
        });
        
        it('unlock conversion event emitted', async function() {
            let { logs } = await this.receiver.acceptConversionUnlock(0, { from: owner });
        
            const event1 = expectEvent.inLogs(logs, 'ConversionUnlockAccepted', {
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                iostMirrorTransactionHash: IOST_TX_HASH,
                amount: new BN('400000000000000000000'),
                fee: new BN('400000000000000000000').mul(new BN(10)).div(new BN(10000)),
                netAmount: new BN('400000000000000000000').sub(new BN('400000000000000000000').mul(new BN(10)).div(new BN(10000))),
                discounted: false,
            });
        
            await this.rteToken.mint(alice, MINIMUM_THRESHOLD_TOKENS, { from: owner });
        
            let { logs: logs2 } = await this.receiver.acceptConversionUnlock(1, { from: owner });
        
            const event2 = expectEvent.inLogs(logs2, 'ConversionUnlockAccepted', {
                ethAddress: alice,
                iostAccount: IOST_ACCOUNT,
                iostMirrorTransactionHash: IOST_TX_HASH,
                amount: new BN('400000000000000000000'),
                fee: new BN('400000000000000000000').mul(new BN(5)).div(new BN(10000)),
                netAmount: new BN('400000000000000000000').sub(new BN('400000000000000000000').mul(new BN(5)).div(new BN(10000))),
                discounted: true,
            });
        })
    });
});