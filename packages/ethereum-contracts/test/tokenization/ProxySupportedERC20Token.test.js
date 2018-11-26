import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import { advanceBlock } from '../helpers/advanceToBlock';
import expectEvent from '../helpers/expectEvent';
import { assertRevert } from '../helpers/assertRevert';

const ProxySupportedERC20Token = artifacts.require("./tokenization/tokens/ProxySupportedERC20Token.sol");
const BaseProxy = artifacts.require("./tokenization/BaseProxy.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const RegistryModule = artifacts.require("./tokenization/modules/RegistryModule.sol");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

// Proxy contract tests are in ERC20ProxyTest
contract('ProxySupported ERC20 Token Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    });

    const [_, owner, actualSender, ...rest] = accounts;
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    beforeEach(async function () {
        // Initialize BaseProxy, ProxySupportedERC20Token contracts.
        this.token = await ProxySupportedERC20Token.new({ from: owner });
        this.proxy = await BaseProxy.new(this.token.address, 'BaseToken', 'BT', 18, { from: owner });

        this.balanceModule = await BalanceModule.new({ from: owner });
        this.allowanceModule = await AllowanceModule.new({ from: owner });
        this.registryModule = await RegistryModule.new({ from: owner });
        await this.balanceModule.transferOwnership(this.token.address, { from: owner });
        await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
        await this.registryModule.transferOwnership(this.token.address, { from: owner });
        await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
        await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
        await this.token.setRegistryModule(this.registryModule.address, { from: owner });

        // Mint some tokens for actualSender and rest[0]
        await this.token.mint(actualSender, 100, { from: owner });
        await this.token.mint(rest[0], 100, { from: owner });

        // Set proxy
        await this.token.setProxy(this.proxy.address, { from: owner });
    });

    describe('setProxy', function () {
        it('only owner can call', async function() {
            await assertRevert(this.token.setProxy(this.proxy.address, { from: rest[0] }));
            await assertRevert(this.token.setProxy(this.proxy.address, { from: actualSender }));
            this.token.setProxy(this.proxy.address, { from: owner });
        });
    });

    describe('transfer with sender', function () {
        it('owner cannot call', async function() {
            await assertRevert(this.token.transferWithSender(actualSender, rest[0], 100, { from: owner }));
        });
    });

    describe('approve with sender', function () {
        it('owner cannot call', async function() {
            await assertRevert(this.token.approveWithSender(actualSender, rest[0], 100, { from: owner }));
        });
    });

    describe('transferFrom with sender', function () {
        it('owner cannot call', async function() {
            await this.token.approve(actualSender, 100, { from: rest[0] });
            await assertRevert(this.token.transferFromWithSender(actualSender, rest[0], rest[1], 100, { from: owner }));
        });
    });

    describe('increaseApproval with sender', function () {
        it('owner cannot call', async function() {
            await assertRevert(this.token.increaseApprovalWithSender(actualSender, rest[0], 100, { from: owner }));
        });
    });

    describe('decreaseApproval with sender', function () {
        it('owner cannot call', async function() {
            await this.token.approve(rest[0], 100, { from: actualSender });
            await assertRevert(this.token.decreaseApprovalWithSender(actualSender, rest[0], 100, { from: owner }));
        });
    });
});