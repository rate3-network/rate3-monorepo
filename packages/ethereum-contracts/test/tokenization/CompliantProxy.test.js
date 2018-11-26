import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import { advanceBlock } from '../helpers/advanceToBlock';
import expectEvent from '../helpers/expectEvent';
import { assertRevert } from '../helpers/assertRevert';

const BaseToken = artifacts.require("./tokenization/BaseToken.sol");
const BaseProxy = artifacts.require("./tokenization/BaseProxy.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const RegistryModule = artifacts.require("./tokenization/modules/RegistryModule.sol");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

// Tests whether proxy is still subject to CompliantToken

contract('Compliant Proxy Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    });

    const [_, owner, ...rest] = accounts;
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const WHITELISTED_FOR_MINT = "WHITELISTED_FOR_MINT";
    const WHITELISTED_FOR_BURN = "WHITELISTED_FOR_BURN";
    const BLACKLISTED = "BLACKLISTED";

    describe('Test - compliance functions', function() {
        beforeEach(async function() {
            this.token = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
            this.proxy = await BaseProxy.new(this.token.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });

            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });

            await this.token.setProxy(this.proxy.address, { from: owner });
        });

        it('blacklisted address cannot transfer tokens as sender', async function() {
            await this.token.setKeyDataRecord(
                rest[0],
                WHITELISTED_FOR_MINT,
                0,
                "",
                ZERO_ADDRESS,
                true,
                owner,
                { from: owner }
            );
            // Mint tokens first
            await this.token.mint(rest[0], 100, { from: owner });
            // Transfer from rest[0] to rest[1]
            await this.proxy.transfer(rest[1], 50, { from: rest[0] });

            // Blacklist rest[0]
            await this.token.setKeyDataRecord(
                rest[0],
                BLACKLISTED,
                0,
                "",
                ZERO_ADDRESS,
                true,
                owner,
                { from: owner }
            );

            await assertRevert(this.proxy.transfer(rest[1], 50, { from: rest[0] }));

            // Unblacklist rest[0]
            await this.token.setKeyDataRecord(
                rest[0],
                BLACKLISTED,
                0,
                "",
                ZERO_ADDRESS,
                false,
                owner,
                { from: owner }
            );

            await this.proxy.transfer(rest[1], 50, { from: rest[0] });
        });

        it('blacklisted address cannot transfer tokens as receiver', async function() {
            await this.token.setKeyDataRecord(
                rest[0],
                WHITELISTED_FOR_MINT,
                0,
                "",
                ZERO_ADDRESS,
                true,
                owner,
                { from: owner }
            );
            // Mint tokens first
            await this.token.mint(rest[0], 100, { from: owner });
            // Transfer from rest[0] to rest[1]
            await this.proxy.transfer(rest[1], 50, { from: rest[0] });

            // Blacklist rest[1]
            await this.token.setKeyDataRecord(
                rest[1],
                BLACKLISTED,
                0,
                "",
                ZERO_ADDRESS,
                true,
                owner,
                { from: owner }
            );

            await assertRevert(this.proxy.transfer(rest[1], 50, { from: rest[0] }));

            // Unblacklist rest[1]
            await this.token.setKeyDataRecord(
                rest[1],
                BLACKLISTED,
                0,
                "",
                ZERO_ADDRESS,
                false,
                owner,
                { from: owner }
            );

            await this.proxy.transfer(rest[1], 50, { from: rest[0] });
        });

        it('blacklisted address cannot transferFrom tokens as spender', async function() {
            await this.token.setKeyDataRecord(
                rest[0],
                WHITELISTED_FOR_MINT,
                0,
                "",
                ZERO_ADDRESS,
                true,
                owner,
                { from: owner }
            );
            // Mint tokens first
            await this.token.mint(rest[0], 100, { from: owner });
            // Approve rest[1] to spend rest[0] token
            await this.token.approve(rest[1], 100, { from: rest[0] });
            // Transfer tokens from rest[0] to rest[2], as rest[1]
            await this.proxy.transferFrom(rest[0], rest[2], 50, { from: rest[1] });

            // Blacklist rest[1]
            await this.token.setKeyDataRecord(
                rest[1],
                BLACKLISTED,
                0,
                "",
                ZERO_ADDRESS,
                true,
                owner,
                { from: owner }
            );

            await assertRevert(this.proxy.transferFrom(rest[0], rest[2], 50, { from: rest[1] }));

            // Unblacklist rest[1]
            await this.token.setKeyDataRecord(
                rest[1],
                BLACKLISTED,
                0,
                "",
                ZERO_ADDRESS,
                false,
                owner,
                { from: owner }
            );

            await this.proxy.transferFrom(rest[0], rest[2], 50, { from: rest[1] });
        });

        it('blacklisted address cannot transferFrom tokens as receiver', async function() {
            await this.token.setKeyDataRecord(
                rest[0],
                WHITELISTED_FOR_MINT,
                0,
                "",
                ZERO_ADDRESS,
                true,
                owner,
                { from: owner }
            );
            // Mint tokens first
            await this.token.mint(rest[0], 100, { from: owner });
            // Approve rest[1] to spend rest[0] token
            await this.token.approve(rest[1], 100, { from: rest[0] });
            // Transfer tokens from rest[0] to rest[2], as rest[1]
            await this.proxy.transferFrom(rest[0], rest[2], 50, { from: rest[1] });

            // Blacklist rest[2]
            await this.token.setKeyDataRecord(
                rest[1],
                BLACKLISTED,
                0,
                "",
                ZERO_ADDRESS,
                true,
                owner,
                { from: owner }
            );

            await assertRevert(this.proxy.transferFrom(rest[0], rest[2], 50, { from: rest[1] }));

            // Unblacklist rest[2]
            await this.token.setKeyDataRecord(
                rest[1],
                BLACKLISTED,
                0,
                "",
                ZERO_ADDRESS,
                false,
                owner,
                { from: owner }
            );

            await this.proxy.transferFrom(rest[0], rest[2], 50, { from: rest[1] });
        });

        it('blacklisted address cannot transferFrom tokens as origin', async function() {
            await this.token.setKeyDataRecord(
                rest[0],
                WHITELISTED_FOR_MINT,
                0,
                "",
                ZERO_ADDRESS,
                true,
                owner,
                { from: owner }
            );
            // Mint tokens first
            await this.token.mint(rest[0], 100, { from: owner });
            // Approve rest[1] to spend rest[0] token
            await this.token.approve(rest[1], 100, { from: rest[0] });
            // Transfer tokens from rest[0] to rest[2], as rest[1]
            await this.proxy.transferFrom(rest[0], rest[2], 50, { from: rest[1] });

            // Blacklist rest[0]
            await this.token.setKeyDataRecord(
                rest[1],
                BLACKLISTED,
                0,
                "",
                ZERO_ADDRESS,
                true,
                owner,
                { from: owner }
            );

            await assertRevert(this.proxy.transferFrom(rest[0], rest[2], 50, { from: rest[1] }));

            // Unblacklist rest[0]
            await this.token.setKeyDataRecord(
                rest[1],
                BLACKLISTED,
                0,
                "",
                ZERO_ADDRESS,
                false,
                owner,
                { from: owner }
            );

            await this.proxy.transferFrom(rest[0], rest[2], 50, { from: rest[1] });
        });
    });
});