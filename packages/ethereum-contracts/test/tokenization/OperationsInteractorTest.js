import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import { advanceBlock } from '../helpers/advanceToBlock';
import expectEvent from '../helpers/expectEvent';

const BaseInteractor = artifacts.require("./tokenization/interactors/BaseInteractor.sol");
const BaseProxy = artifacts.require("./tokenization/BaseProxy.sol");
const BaseToken = artifacts.require("./tokenization/BaseToken.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const RegistryModule = artifacts.require("./tokenization/modules/RegistryModule.sol");


require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

contract('OperationsInteractor Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    });

    const [owner, admin1, admin2, ...rest] = accounts;

    describe('Test - mint request operations', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new({ from: owner });
            this.proxy = await BaseProxy.new(this.token.address, 'BaseToken', 'BT', 18, { from: owner });
            this.interactor = await BaseInteractor.new(this.token.address, this.proxy.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // rest[0] and rest[1] addresses are whitelisted for mint.
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });
        });

        it('anyone can submit as many mint requests', async function() {
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] }).should.be.fulfilled;
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.fulfilled;
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.fulfilled;
        });

        it('mint requests are indexed', async function() {
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });

            await this.interactor.approveMint(rest[0], 0, { from: admin1 }).should.be.fulfilled;
            await this.interactor.approveMint(rest[0], 1, { from: admin1 }).should.be.fulfilled;
            await this.interactor.approveMint(rest[0], 2, { from: admin1 }).should.be.fulfilled;
            await this.interactor.approveMint(rest[0], new web3.BigNumber('3'), { from: admin1 }).should.be.fulfilled;
        });

        it('mint requests blocked if not whitelisted', async function() {
            await this.interactor.whitelistForMint(rest[0], false, { from: admin2 });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] }).should.be.rejected;
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.fulfilled;
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.fulfilled;
        });

        it('mint requests blocked if blacklisted', async function() {
            await this.interactor.blacklist(rest[0], true, { from: admin2 });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] }).should.be.rejected;
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.fulfilled;
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.fulfilled;
        });

        it('mint requests blocked if paused', async function() {
            await this.interactor.pauseOperations({ from: owner });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] }).should.be.rejected;
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.rejected;
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.rejected;

            await this.interactor.unpauseOperations({ from: owner });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] }).should.be.fulfilled;
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.fulfilled;
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.fulfilled;
        });

        it('mint request event emitted', async function() {
            const { logs } = await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });

            const event1 = expectEvent.inLogs(logs, 'MintOperationRequested', {
                by: rest[0],
            });
        })
    });

    describe('Test - mint approve operations', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new({ from: owner });
            this.proxy = await BaseProxy.new(this.token.address, 'BaseToken', 'BT', 18, { from: owner });
            this.interactor = await BaseInteractor.new(this.token.address, this.proxy.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // rest[0] and rest[1] addresses are whitelisted for mint.
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });
            
            // Request mint for rest[0].
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
        });

        it('owner cannot approve mint request', async function() {
            await this.interactor.approveMint(rest[0], 0, { from: owner }).should.be.rejected;
        });

        it('admin1 can approve mint request', async function() {
            await this.interactor.approveMint(rest[0], 0, { from: admin1 }).should.be.fulfilled;
        });

        it('non-owner/admin2 cannot approve mint request', async function() {
            await this.interactor.approveMint(rest[0], 0, { from: admin2 }).should.be.rejected;
            await this.interactor.approveMint(rest[0], 0, { from: rest[0] }).should.be.rejected;
            await this.interactor.approveMint(rest[0], 0, { from: rest[1] }).should.be.rejected;
        });

        it('cannot approve non-existing mint operations', async function() {
            await this.interactor.approveMint(rest[0], 1, { from: admin1 }).should.be.rejected;
            await this.interactor.approveMint(rest[0], 1, { from: admin2 }).should.be.rejected;
        });

        it('mint approval blocked if not whitelisted', async function() {
            await this.interactor.whitelistForMint(rest[0], false, { from: admin2 });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('mint approval blocked if blacklisted', async function() {
            await this.interactor.blacklist(rest[0], true, { from: admin2 });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('mint approval blocked if paused', async function() {
            await this.interactor.pauseOperations({ from: owner });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 }).should.be.rejected;

            await this.interactor.unpauseOperations({ from: owner });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 }).should.be.fulfilled;
        });

        it('cannot approve approved Operation index', async function() {
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
    
            await this.interactor.approveMint(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('cannot approve finalized Operation index', async function() {
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
        
            await this.interactor.approveMint(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('cannot approve revoked Operation index', async function() {
            await this.interactor.revokeMint(rest[0], 0, { from: admin2 });
        
            await this.interactor.approveMint(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('mint approval event emitted', async function() {
            const { logs } = await this.interactor.approveMint(rest[0], 0, { from: admin1 });

            const event1 = expectEvent.inLogs(logs, 'MintOperationApproved', {
                by: rest[0],
                approvedBy: admin1,
            });
        })
    });

    describe('Test - mint finalize operations', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new({ from: owner });
            this.proxy = await BaseProxy.new(this.token.address, 'BaseToken', 'BT', 18, { from: owner });
            this.interactor = await BaseInteractor.new(this.token.address, this.proxy.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // rest[0] and rest[1] addresses are whitelisted for mint.
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });

            // Requested and approved mint for rest[0].
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });

            // Requested and approved mint for rest[1].
            await this.interactor.requestMint(new web3.BigNumber('5000e+18'), { from: rest[1] });
            await this.interactor.approveMint(rest[1], 0, { from: admin1 });
        });

        it('owner cannot finalize mint request', async function() {
            await this.interactor.finalizeMint(rest[0], 0, { from: owner }).should.be.rejected;
        });

        it('admin2 can finalize mint request', async function() {
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 }).should.be.fulfilled;
        });

        it('non-owner/admin1 cannot finalize mint request', async function() {
            await this.interactor.finalizeMint(rest[0], 0, { from: admin1 }).should.be.rejected;
            await this.interactor.finalizeMint(rest[0], 0, { from: rest[0] }).should.be.rejected;
            await this.interactor.finalizeMint(rest[0], 0, { from: rest[1] }).should.be.rejected;
        });

        it('cannot finalize non-existing mint operations', async function() {
            await this.interactor.finalizeMint(rest[0], 1, { from: admin1 }).should.be.rejected;
            await this.interactor.finalizeMint(rest[0], 1, { from: admin2 }).should.be.rejected;
        });

        it('mint finalize blocked if not whitelisted', async function() {
            await this.interactor.whitelistForMint(rest[0], false, { from: admin2 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 }).should.be.rejected;
        });

        it('mint finalize blocked if blacklisted', async function() {
            await this.interactor.blacklist(rest[0], true, { from: admin2 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 }).should.be.rejected;
        });

        it('mint finalize blocked if paused', async function() {
            await this.interactor.pauseOperations({ from: owner });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 }).should.be.rejected;

            await this.interactor.unpauseOperations({ from: owner });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 }).should.be.fulfilled;
        });

        it('cannot finalize requested Operation index', async function() {
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });

            await this.interactor.finalizeMint(rest[0], 1, { from: admin2 }).should.be.rejected;
        });

        it('cannot finalize finalized Operation index', async function() {
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
        
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 }).should.be.rejected;
        });

        it('cannot finalize revoked Operation index', async function() {
            await this.interactor.revokeMint(rest[0], 0, { from: admin2 });
        
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 }).should.be.rejected;
        });

        it('check finalize actually mints tokens', async function() {
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
            (await this.token.balanceOf(rest[0])).should.be.bignumber.equal(new web3.BigNumber('10000e+18'));
            await this.interactor.finalizeMint(rest[1], 0, { from: admin2 });
            (await this.token.balanceOf(rest[1])).should.be.bignumber.equal(new web3.BigNumber('5000e+18'));
        });

        it('mint finalize event emitted', async function() {
            const { logs } = await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });

            const event1 = expectEvent.inLogs(logs, 'MintOperationFinalized', {
                by: rest[0],
                finalizedBy: admin2,
            });
        })
    });


    describe('Test - mint revoke operations', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new({ from: owner });
            this.proxy = await BaseProxy.new(this.token.address, 'BaseToken', 'BT', 18, { from: owner });
            this.interactor = await BaseInteractor.new(this.token.address, this.proxy.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // rest[0] and rest[1] addresses are whitelisted for mint.
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });

            // Mint 10000 tokens for rest[0] and rest[1].
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] });
        });

        it('owner cannot revoke mint request', async function() {
            await this.interactor.revokeMint(rest[0], 0, { from: owner }).should.be.rejected;
        });

        it('admin1 can revoke mint request', async function() {
            await this.interactor.revokeMint(rest[0], 0, { from: admin1 }).should.be.fulfilled;
        });

        it('admin2 can revoke mint request', async function() {
            await this.interactor.revokeMint(rest[0], 0, { from: admin2 }).should.be.fulfilled;
        });

        it('cannot revoke non-existing mint operations', async function() {
            await this.interactor.revokeMint(rest[0], 1, { from: admin2 }).should.be.rejected;
            await this.interactor.revokeMint(rest[1], 1, { from: admin2 }).should.be.rejected;
        });

        it('revoked mint cannot be approved', async function() {
            await this.interactor.revokeMint(rest[1], 0, { from: admin1 });
            await this.interactor.approveMint(rest[1], 0, { from: admin1 }).should.be.rejected;
        });

        it('revoked mint cannot be finalized', async function() {
            await this.interactor.revokeMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 }).should.be.rejected;
        });

        it('cannot revoke finalized Operation index', async function() {
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
        
            await this.interactor.revokeMint(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('cannot revoke revoked Operation index', async function() {
            await this.interactor.revokeMint(rest[0], 0, { from: admin2 });
        
            await this.interactor.revokeMint(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('mint revoked event emitted', async function() {
            const { logs } = await this.interactor.revokeMint(rest[0], 0, { from: admin1 });

            const event1 = expectEvent.inLogs(logs, 'MintOperationRevoked', {
                by: rest[0],
                revokedBy: admin1,
            });
        })
    });

    describe('Test - burn request operations', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new({ from: owner });
            this.proxy = await BaseProxy.new(this.token.address, 'BaseToken', 'BT', 18, { from: owner });
            this.interactor = await BaseInteractor.new(this.token.address, this.proxy.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // rest[0] and rest[1] addresses are whitelisted for mint and burn.
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[1], true, { from: admin2 });

            // Mint 10000 tokens for rest[0] and rest[1].
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] });
            await this.interactor.approveMint(rest[1], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[1], 0, { from: admin2 });
        });

        it('anyone can submit as many burn requests if they have the balance', async function() {
            await this.interactor.requestBurn(new web3.BigNumber('5000e+18'), { from: rest[0] }).should.be.fulfilled;
            await this.interactor.requestBurn(new web3.BigNumber('5000e+18'), { from: rest[0] }).should.be.fulfilled;
            await this.interactor.requestBurn(new web3.BigNumber('1000e+18'), { from: rest[0] }).should.be.rejected;
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.fulfilled;
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.rejected;
        });

        it('burn requests are indexed', async function() {
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[0] });
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[0] });
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[0] });
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[0] });

            await this.interactor.approveBurn(rest[0], 0, { from: admin1 }).should.be.fulfilled;
            await this.interactor.approveBurn(rest[0], 1, { from: admin1 }).should.be.fulfilled;
            await this.interactor.approveBurn(rest[0], 2, { from: admin1 }).should.be.fulfilled;
            await this.interactor.approveBurn(rest[0], new web3.BigNumber('3'), { from: admin1 }).should.be.fulfilled;
        });

        it('burn requests blocked if not whitelisted', async function() {
            await this.interactor.whitelistForBurn(rest[0], false, { from: admin2 });
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[0] }).should.be.rejected;
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[1] }).should.be.fulfilled;
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[1] }).should.be.fulfilled;
        });

        it('burn requests blocked if blacklisted', async function() {
            await this.interactor.blacklist(rest[0], true, { from: admin2 });
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[0] }).should.be.rejected;
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[1] }).should.be.fulfilled;
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[1] }).should.be.fulfilled;
        }); 

        it('burn requests blocked if paused', async function() {
            await this.interactor.pauseOperations({ from: owner });
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[0] }).should.be.rejected;
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[1] }).should.be.rejected;
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[1] }).should.be.rejected;

            await this.interactor.unpauseOperations({ from: owner });
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[0] }).should.be.fulfilled;
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[1] }).should.be.fulfilled;
            await this.interactor.requestBurn(new web3.BigNumber('2000e+18'), { from: rest[1] }).should.be.fulfilled;
        });

        it('check request actually burns tokens', async function() {
            await this.interactor.requestBurn(new web3.BigNumber('5000e+18'), { from: rest[0] });
            (await this.token.balanceOf(rest[0])).should.be.bignumber.equal(new web3.BigNumber('5000e+18'));
            await this.interactor.requestBurn(new web3.BigNumber('5000e+18'), { from: rest[0] });
            (await this.token.balanceOf(rest[0])).should.be.bignumber.equal(new web3.BigNumber(0));
        });

        it('burn request event emitted', async function() {
            const { logs } = await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });

            const event1 = expectEvent.inLogs(logs, 'BurnOperationRequested', {
                by: rest[0],
            });
        })
    });

    describe('Test - burn approve operations', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new({ from: owner });
            this.proxy = await BaseProxy.new(this.token.address, 'BaseToken', 'BT', 18, { from: owner });
            this.interactor = await BaseInteractor.new(this.token.address, this.proxy.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // rest[0] and rest[1] addresses are whitelisted for mint and burn.
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[1], true, { from: admin2 });

            // Mint 10000 tokens for rest[0] and rest[1].
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] });
            await this.interactor.approveMint(rest[1], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[1], 0, { from: admin2 });

            // Requested burn
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });
        });

        it('owner cannot approve burn request', async function() {
            await this.interactor.approveBurn(rest[0], 0, { from: owner }).should.be.rejected;
        });

        it('admin1 can approve burn request', async function() {
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 }).should.be.fulfilled;
        });

        it('non-owner/admin2 cannot approve burn request', async function() {
            await this.interactor.approveBurn(rest[0], 0, { from: admin2 }).should.be.rejected;
            await this.interactor.approveBurn(rest[0], 0, { from: rest[0] }).should.be.rejected;
            await this.interactor.approveBurn(rest[0], 0, { from: rest[1] }).should.be.rejected;
        });

        it('cannot approve non-existing burn operations', async function() {
            await this.interactor.approveBurn(rest[0], 1, { from: admin1 }).should.be.rejected;
            await this.interactor.approveBurn(rest[0], 1, { from: admin2 }).should.be.rejected;
        });

        it('burn approval blocked if not whitelisted', async function() {
            await this.interactor.whitelistForBurn(rest[0], false, { from: admin2 });
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('burn approval blocked if blacklisted', async function() {
            await this.interactor.blacklist(rest[0], true, { from: admin2 });
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('burn approval blocked if paused', async function() {
            await this.interactor.pauseOperations({ from: owner });
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 }).should.be.rejected;

            await this.interactor.unpauseOperations({ from: owner });
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 }).should.be.fulfilled;
        });

        it('cannot approve approved Operation index', async function() {
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 });
    
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('cannot approve finalized Operation index', async function() {
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin2 });
        
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('cannot approve revoked Operation index', async function() {
            await this.interactor.revokeBurn(rest[0], 0, { from: admin2 });
        
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('burn approval event emitted', async function() {
            const { logs } = await this.interactor.approveBurn(rest[0], 0, { from: admin1 });

            const event1 = expectEvent.inLogs(logs, 'BurnOperationApproved', {
                by: rest[0],
                approvedBy: admin1,
            });
        })
    });

    describe('Test - burn finalize operations', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new({ from: owner });
            this.proxy = await BaseProxy.new(this.token.address, 'BaseToken', 'BT', 18, { from: owner });
            this.interactor = await BaseInteractor.new(this.token.address, this.proxy.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // rest[0] and rest[1] addresses are whitelisted for mint and burn.
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[1], true, { from: admin2 });

            // Mint 10000 tokens for rest[0] and rest[1].
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] });
            await this.interactor.approveMint(rest[1], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[1], 0, { from: admin2 });

            // Requested and approved burn for rest[0].
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 });

            // Requested burn for rest[1].
            await this.interactor.requestBurn(new web3.BigNumber('5000e+18'), { from: rest[1] });
        });

        it('owner cannot finalize burn request', async function() {
            await this.interactor.finalizeBurn(rest[0], 0, { from: owner }).should.be.rejected;
        });

        it('admin2 can finalize burn request', async function() {
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin2 }).should.be.fulfilled;
        });

        it('non-owner/admin1 cannot finalize mint request', async function() {
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin1 }).should.be.rejected;
            await this.interactor.finalizeBurn(rest[0], 0, { from: rest[0] }).should.be.rejected;
            await this.interactor.finalizeBurn(rest[0], 0, { from: rest[1] }).should.be.rejected;
        });

        it('cannot finalize non-existing burn operations', async function() {
            await this.interactor.finalizeBurn(rest[0], 1, { from: admin1 }).should.be.rejected;
            await this.interactor.finalizeBurn(rest[0], 1, { from: admin2 }).should.be.rejected;
        });

        it('burn finalize blocked if not whitelisted', async function() {
            await this.interactor.whitelistForBurn(rest[0], false, { from: admin2 });
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin2 }).should.be.rejected;
        });

        it('burn finalize blocked if blacklisted', async function() {
            await this.interactor.blacklist(rest[0], true, { from: admin2 });
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin2 }).should.be.rejected;
        });

        it('burn finalize blocked if paused', async function() {
            await this.interactor.pauseOperations({ from: owner });
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin2 }).should.be.rejected;

            await this.interactor.unpauseOperations({ from: owner });
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin2 }).should.be.fulfilled;
        });

        it('cannot finalize requested Operation index', async function() {
            await this.interactor.requestBurn(new web3.BigNumber('5000e+18'), { from: rest[1] });

            await this.interactor.finalizeBurn(rest[0], 1, { from: admin2 }).should.be.rejected;
        });

        it('cannot finalize finalized Operation index', async function() {
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin2 });
        
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin2 }).should.be.rejected;
        });

        it('cannot finalize revoked Operation index', async function() {
            await this.interactor.revokeBurn(rest[0], 0, { from: admin2 });
        
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin2 }).should.be.rejected;
        });


        it('burn finalize event emitted', async function() {
            const { logs } = await this.interactor.finalizeBurn(rest[0], 0, { from: admin2 });

            const event1 = expectEvent.inLogs(logs, 'BurnOperationFinalized', {
                by: rest[0],
                finalizedBy: admin2,
            });
        })
    });

    describe('Test - burn revoke operations', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new({ from: owner });
            this.proxy = await BaseProxy.new(this.token.address, 'BaseToken', 'BT', 18, { from: owner });
            this.interactor = await BaseInteractor.new(this.token.address, this.proxy.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // rest[0] and rest[1] addresses are whitelisted for mint and burn.
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[1], true, { from: admin2 });

            // Mint 10000 tokens for rest[0] and rest[1].
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] });
            await this.interactor.approveMint(rest[1], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[1], 0, { from: admin2 });

            // Requested and approved burn for rest[0].
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 });

            // Requested burn for rest[1].
            await this.interactor.requestBurn(new web3.BigNumber('5000e+18'), { from: rest[1] }); 
        });

        it('owner cannot revoke burn request', async function() {
            await this.interactor.revokeBurn(rest[0], 0, { from: owner }).should.be.rejected;
        });

        it('admin1 can revoke burn request', async function() {
            await this.interactor.revokeBurn(rest[0], 0, { from: admin1 }).should.be.fulfilled;
        });

        it('admin2 can revoke burn request', async function() {
            await this.interactor.revokeBurn(rest[0], 0, { from: admin2 }).should.be.fulfilled;
        });

        it('cannot revoke non-existing burn operations', async function() {
            await this.interactor.revokeBurn(rest[0], 1, { from: admin2 }).should.be.rejected;
            await this.interactor.revokeBurn(rest[1], 1, { from: admin2 }).should.be.rejected;
        });

        it('revoked burns cannot be approved', async function() {
            await this.interactor.revokeBurn(rest[1], 0, { from: admin1 }).should.be.fulfilled;
            await this.interactor.approveBurn(rest[1], 0, { from: admin1 }).should.be.rejected;
        });

        it('revoked burns cannot be finalized', async function() {
            await this.interactor.revokeBurn(rest[0], 0, { from: admin1 }).should.be.fulfilled;
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin2 }).should.be.rejected;
        });

        it('cannot revoke finalized Operation index', async function() {
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin2 });
        
            await this.interactor.revokeBurn(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('cannot revoke revoked Operation index', async function() {
            await this.interactor.revokeBurn(rest[0], 0, { from: admin2 });
        
            await this.interactor.revokeBurn(rest[0], 0, { from: admin1 }).should.be.rejected;
        });

        it('check revoke actually refunds tokens', async function() {
            (await this.token.balanceOf(rest[1])).should.be.bignumber.equal(new web3.BigNumber('5000e+18'));
            await this.interactor.revokeBurn(rest[1], 0, { from: admin2 });
            (await this.token.balanceOf(rest[1])).should.be.bignumber.equal(new web3.BigNumber('10000e+18'));
        });

        it('burn revoked event emitted', async function() {
            const { logs } = await this.interactor.revokeBurn(rest[0], 0, { from: admin1 });

            const event1 = expectEvent.inLogs(logs, 'BurnOperationRevoked', {
                by: rest[0],
                revokedBy: admin1,
            });
        })
    });

    describe('Test - pause/unpause operations', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new({ from: owner });
            this.proxy = await BaseProxy.new(this.token.address, 'BaseToken', 'BT', 18, { from: owner });
            this.interactor = await BaseInteractor.new(this.token.address, this.proxy.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });
        });

        it('only owner can pause/unpause operations', async function() {
            await this.interactor.pauseOperations({ from: admin1 }).should.be.rejected;
            await this.interactor.pauseOperations({ from: admin2 }).should.be.rejected;
            await this.interactor.pauseOperations({ from: owner }).should.be.fulfilled;

            await this.interactor.unpauseOperations({ from: admin1 }).should.be.rejected;
            await this.interactor.unpauseOperations({ from: admin2 }).should.be.rejected;
            await this.interactor.unpauseOperations({ from: owner }).should.be.fulfilled;
        });
    });

    describe('Test - pause/unpause token', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new({ from: owner });
            this.proxy = await BaseProxy.new(this.token.address, 'BaseToken', 'BT', 18, { from: owner });
            this.interactor = await BaseInteractor.new(this.token.address, this.proxy.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // rest[0] is whitelisted for mint.
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });

            // Mint 10000 tokens for rest[0].
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
        });

        it('only owner can pause/unpause token', async function() {
            await this.interactor.pauseToken({ from: admin1 }).should.be.rejected;
            await this.interactor.pauseToken({ from: admin2 }).should.be.rejected;
            await this.interactor.pauseToken({ from: owner }).should.be.fulfilled;

            await this.interactor.unpauseToken({ from: admin1 }).should.be.rejected;
            await this.interactor.unpauseToken({ from: admin2 }).should.be.rejected;
            await this.interactor.unpauseToken({ from: owner }).should.be.fulfilled;
        });

        it('tokens cannot be transferred when paused', async function() {
            await this.token.transfer(rest[1], new web3.BigNumber('5000e+18'), { from: rest[0] }).should.be.fulfilled;
            await this.interactor.pauseToken({ from: owner })
            await this.token.transfer(rest[1], new web3.BigNumber('5000e+18'), { from: rest[0] }).should.be.rejected;
            await this.interactor.unpauseToken({ from: owner })
            await this.token.transfer(rest[1], new web3.BigNumber('5000e+18'), { from: rest[0] }).should.be.fulfilled;
        });
    });

    describe('Test - sweep tokens', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new({ from: owner });
            this.proxy = await BaseProxy.new(this.token.address, 'BaseToken', 'BT', 18, { from: owner });
            this.interactor = await BaseInteractor.new(this.token.address, this.proxy.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // rest[0] is whitelisted for mint.
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });

            // Mint 10000 tokens for rest[0].
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
        });

        it('only owner can sweep tokens', async function() {
            await this.interactor.sweepToken(rest[0], rest[1], new web3.BigNumber('10000e+18'), { from: admin1 }).should.be.rejected;
            await this.interactor.sweepToken(rest[0], rest[1], new web3.BigNumber('10000e+18'), { from: admin2 }).should.be.rejected;
            await this.interactor.sweepToken(rest[0], rest[1], new web3.BigNumber('10000e+18'), { from: rest[0] }).should.be.rejected;
            await this.interactor.sweepToken(rest[0], rest[1], new web3.BigNumber('10000e+18'), { from: owner }).should.be.fulfilled;
        });

        it('tokens are transferred', async function() {
            await this.interactor.sweepToken(rest[0], rest[1], new web3.BigNumber('10000e+18'), { from: owner });
            const tokenAmount1 = await this.token.balanceOf(rest[0]);
            const tokenAmount2 = await this.token.balanceOf(rest[1]);
            tokenAmount1.should.be.bignumber.equal(0);
            tokenAmount2.should.be.bignumber.equal(new web3.BigNumber('10000e+18'));
        });
    });
});