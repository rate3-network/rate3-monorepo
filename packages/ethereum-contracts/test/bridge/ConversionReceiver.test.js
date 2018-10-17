import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import { advanceBlock } from '../helpers/advanceToBlock';
import { assertRevert } from '../helpers/assertRevert';
import expectEvent from '../helpers/expectEvent';

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
    const STELLAR_ADDRESS = 'GDOLD5H3UWDJ6GSOERAIF4TBJ4WPCQTQBKCRHYTPYSVC4B3DAUAP77OL';
    const STELLAR_SECRET = 'SALZVKPAM3IQXFEDMHRXPBNHF46RDGDSZHNLVIOKNYTB5NVQVHOYRDU4';

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
            await assertRevert(this.receiver.requestConversion(new web3.BigNumber('1000e+18'), STELLAR_ADDRESS, { from: alice }));
        });

        it('request conversion exceeding token balance should fail', async function() {
            await this.token.approve(this.receiver.address, new web3.BigNumber('1500e+18'), { from: alice });
            await assertRevert(this.receiver.requestConversion(new web3.BigNumber('1500e+18'), STELLAR_ADDRESS, { from: alice }));
        });

        it('request conversion should pass if balance and allowance are right', async function() {
            await this.token.approve(this.receiver.address, new web3.BigNumber('1500e+18'), { from: alice });
            await this.receiver.requestConversion(new web3.BigNumber('1000e+18'), STELLAR_ADDRESS, { from: alice });
        });

        // it('request conversion event emitted', async function() {
        //     await this.token.approve(this.receiver.address, new web3.BigNumber('1500e+18'), { from: alice });
        //     let { logs } = await this.receiver.requestConversion(new web3.BigNumber('400e+18'), STELLAR_ADDRESS, { from: alice });
        //     console.log(logs, web3.fromAscii(STELLAR_ADDRESS), web3.toHex(STELLAR_ADDRESS));
        //     const event1 = expectEvent.inLogs(logs, 'ConversionRequested', {
        //         ethAddress: alice,
        //         stellarAddress: web3.fromAscii(STELLAR_ADDRESS),
        //     });
        // })
    });
});