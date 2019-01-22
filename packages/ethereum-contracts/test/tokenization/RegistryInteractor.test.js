import { BN, constants, expectEvent, time, shouldFail } from 'openzeppelin-test-helpers';

const BaseInteractor = artifacts.require("./tokenization/interactors/BaseInteractor.sol");
const BaseProxy = artifacts.require("./tokenization/BaseProxy.sol");
const BaseToken = artifacts.require("./tokenization/BaseToken.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const RegistryModule = artifacts.require("./tokenization/modules/RegistryModule.sol");


require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract('RegistryInteractor Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await time.advanceBlock();
    });

    const [owner, admin1, admin2, ...rest] = accounts;

    describe('Test - whitelist for mint', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
            this.proxy = await BaseProxy.new(this.token.address, { from: owner });
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

        it('owner cannot whitelist for mint', async function() {
            await shouldFail.reverting(this.interactor.whitelistForMint(rest[0], true, { from: owner }));
        });

        it('admin1 can whitelist for mint', async function() {
            await this.interactor.whitelistForMint(rest[0], true, { from: admin1 });
        });

        it('admin2 can whitelist for mint', async function() {
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
        });

        it('non-owner cannot whitelist for mint', async function() {
            await shouldFail.reverting(this.interactor.whitelistForMint(rest[0], true, { from: rest[0] }));
            await shouldFail.reverting(this.interactor.whitelistForMint(rest[0], true, { from: rest[1] }));
        });

        it('multi-approval whitelist for mint', async function() {
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.finalizeWhitelistForMint(rest[0], true, { from: admin1 });
        });

        it('cannot approve own whitelist for mint', async function() {
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await shouldFail.reverting(this.interactor.finalizeWhitelistForMint(rest[0], true, { from: admin2 }));
        });

        it('cannot whitelist for mint if there is already pending', async function() {
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await shouldFail.reverting(this.interactor.whitelistForMint(rest[0], true, { from: admin1 }));
            await shouldFail.reverting(this.interactor.whitelistForMint(rest[0], false, { from: admin1 }));
            await shouldFail.reverting(this.interactor.whitelistForMint(rest[0], true, { from: admin2 }));
            await shouldFail.reverting(this.interactor.whitelistForMint(rest[0], false, { from: admin2 }));
        });

        it('matching status value required', async function() {
            await this.interactor.whitelistForMint(rest[0], true, { from: admin1 });
            await shouldFail.reverting(this.interactor.finalizeWhitelistForMint(rest[0], false, { from: admin2 }));
            await this.interactor.finalizeWhitelistForMint(rest[0], true, { from: admin2 });

            // Should pass now, since previous whitelist event settled.
            await this.interactor.whitelistForMint(rest[0], false, { from: admin2 });

            await shouldFail.reverting(this.interactor.finalizeWhitelistForMint(rest[0], false, { from: admin2 }));
            await shouldFail.reverting(this.interactor.finalizeWhitelistForMint(rest[0], true, { from: admin2 }));
            await shouldFail.reverting(this.interactor.finalizeWhitelistForMint(rest[0], true, { from: admin1 }));
            await this.interactor.finalizeWhitelistForMint(rest[0], false, { from: admin1 });
        });

        it('revoke whitelist for mint is idempotent', async function() {
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.revokeWhitelistForMint(rest[0], { from: admin2 });
            await this.interactor.revokeWhitelistForMint(rest[0], { from: admin2 });
            await this.interactor.revokeWhitelistForMint(rest[0], { from: admin1 });
        });
    });

    describe('Test - whitelist for burn', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
            this.proxy = await BaseProxy.new(this.token.address, { from: owner });
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

        it('owner cannot whitelist for burn', async function() {
            await shouldFail.reverting(this.interactor.whitelistForBurn(rest[0], true, { from: owner }));
        });

        it('admin1 can whitelist for burn', async function() {
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin1 });
        });

        it('admin2 can whitelist for burn', async function() {
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin2 });
        });

        it('non-owner cannot whitelist for burn', async function() {
            await shouldFail.reverting(this.interactor.whitelistForBurn(rest[0], true, { from: rest[0] }));
            await shouldFail.reverting(this.interactor.whitelistForBurn(rest[0], true, { from: rest[1] }));
        });

        it('multi-approval whitelist for burn', async function() {
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin2 });
            await this.interactor.finalizeWhitelistForBurn(rest[0], true, { from: admin1 });
        });

        it('cannot approve own whitelist for burn', async function() {
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin2 });
            await shouldFail.reverting(this.interactor.finalizeWhitelistForBurn(rest[0], true, { from: admin2 }));
        });

        it('cannot whitelist for burn if there is already pending', async function() {
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin2 });
            await shouldFail.reverting(this.interactor.whitelistForBurn(rest[0], true, { from: admin1 }));
            await shouldFail.reverting(this.interactor.whitelistForBurn(rest[0], false, { from: admin1 }));
            await shouldFail.reverting(this.interactor.whitelistForBurn(rest[0], true, { from: admin2 }));
            await shouldFail.reverting(this.interactor.whitelistForBurn(rest[0], false, { from: admin2 }));
        });

        it('matching status value required', async function() {
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin1 });
            await shouldFail.reverting(this.interactor.finalizeWhitelistForBurn(rest[0], false, { from: admin2 }));
            await this.interactor.finalizeWhitelistForBurn(rest[0], true, { from: admin2 });

            // Should pass now, since previous whitelist event settled.
            await this.interactor.whitelistForBurn(rest[0], false, { from: admin2 });

            await shouldFail.reverting(this.interactor.finalizeWhitelistForBurn(rest[0], false, { from: admin2 }));
            await shouldFail.reverting(this.interactor.finalizeWhitelistForBurn(rest[0], true, { from: admin2 }));
            await shouldFail.reverting(this.interactor.finalizeWhitelistForBurn(rest[0], true, { from: admin1 }));
            await this.interactor.finalizeWhitelistForBurn(rest[0], false, { from: admin1 });
        });

        it('revoke whitelist for burn is idempotent', async function() {
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin2 });
            await this.interactor.revokeWhitelistForBurn(rest[0], { from: admin2 });
            await this.interactor.revokeWhitelistForBurn(rest[0], { from: admin2 });
            await this.interactor.revokeWhitelistForBurn(rest[0], { from: admin1 });
        });
    });

    describe('Test - blacklist', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and BaseInteractor contracts.
            this.token = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
            this.proxy = await BaseProxy.new(this.token.address, { from: owner });
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

        it('owner cannot blacklist', async function() {
            await shouldFail.reverting(this.interactor.blacklist(rest[0], true, { from: owner }));
        });

        it('admin1 can blacklist', async function() {
            await this.interactor.blacklist(rest[0], true, { from: admin1 });
        });

        it('admin2 can blacklist', async function() {
            await this.interactor.blacklist(rest[0], true, { from: admin2 });
        });

        it('non-owner cannot blacklist', async function() {
            await shouldFail.reverting(this.interactor.blacklist(rest[0], true, { from: rest[0] }));
            await shouldFail.reverting(this.interactor.blacklist(rest[0], true, { from: rest[1] }));
        });

        it('multi-approval blacklist', async function() {
            await this.interactor.blacklist(rest[0], true, { from: admin2 });
            await this.interactor.finalizeBlacklist(rest[0], true, { from: admin1 });
        });

        it('cannot approve own whitelist for mint', async function() {
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await shouldFail.reverting(this.interactor.finalizeBlacklist(rest[0], true, { from: admin2 }));
        });

        it('cannot whitelist for mint if there is already pending', async function() {
            await this.interactor.blacklist(rest[0], true, { from: admin2 });
            await shouldFail.reverting(this.interactor.blacklist(rest[0], true, { from: admin1 }));
            await shouldFail.reverting(this.interactor.blacklist(rest[0], false, { from: admin1 }));
            await shouldFail.reverting(this.interactor.blacklist(rest[0], true, { from: admin2 }));
            await shouldFail.reverting(this.interactor.blacklist(rest[0], false, { from: admin2 }));
        });

        it('matching status value required', async function() {
            await this.interactor.blacklist(rest[0], true, { from: admin1 });
            await shouldFail.reverting(this.interactor.finalizeBlacklist(rest[0], false, { from: admin2 }));
            await this.interactor.finalizeBlacklist(rest[0], true, { from: admin2 });

            // Should pass now, since previous whitelist event settled.
            await this.interactor.blacklist(rest[0], false, { from: admin2 });

            await shouldFail.reverting(this.interactor.finalizeBlacklist(rest[0], false, { from: admin2 }));
            await shouldFail.reverting(this.interactor.finalizeBlacklist(rest[0], true, { from: admin2 }));
            await shouldFail.reverting(this.interactor.finalizeBlacklist(rest[0], true, { from: admin1 }));
            await this.interactor.finalizeBlacklist(rest[0], false, { from: admin1 });
        });

        it('revoke whitelist for mint is idempotent', async function() {
            await this.interactor.blacklist(rest[0], true, { from: admin2 });
            await this.interactor.revokeBlacklist(rest[0], { from: admin2 });
            await this.interactor.revokeBlacklist(rest[0], { from: admin2 });
            await this.interactor.revokeBlacklist(rest[0], { from: admin1 });
        });

        it('blacklist stops mint process', async function() {
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.finalizeWhitelistForMint(rest[0], true, { from: admin1 });

            await this.interactor.requestMint(new BN('10000'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });

            await this.interactor.blacklist(rest[0], true, { from: admin2 });
            await this.interactor.finalizeBlacklist(rest[0], true, { from: admin1 });

            // Already blocked by OperationsInteractor
            await shouldFail.reverting(this.interactor.requestMint(new BN('10000'), { from: rest[0] }));
            await shouldFail.reverting(this.interactor.approveMint(rest[0], 1, { from: admin1 }));
            await shouldFail.reverting(this.interactor.finalizeMint(rest[0], 1, { from: admin2 }));
        });

        it('blacklist stops burn process', async function() {
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.finalizeWhitelistForMint(rest[0], true, { from: admin1 });

            await this.interactor.requestMint(new BN('20000'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });

            await this.interactor.whitelistForBurn(rest[0], true, { from: admin2 });
            await this.interactor.finalizeWhitelistForBurn(rest[0], true, { from: admin1 });

            await this.interactor.requestBurn(new BN('10000'), { from: rest[0] });
            await this.interactor.approveBurn(rest[0], 0, { from: admin2 });
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin1 });

            await this.interactor.blacklist(rest[0], true, { from: admin2 });
            await this.interactor.finalizeBlacklist(rest[0], true, { from: admin1 });

            // Already blocked by OperationsInteractor
            await shouldFail.reverting(this.interactor.requestBurn(new BN('10000'), { from: rest[0] }));
            await shouldFail.reverting(this.interactor.approveBurn(rest[0], 1, { from: admin2 }));
            await shouldFail.reverting(this.interactor.finalizeBurn(rest[0], 1, { from: admin1 }));
        });

        it('blacklist stops transfer process', async function() {
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });
            await this.interactor.finalizeWhitelistForMint(rest[0], true, { from: admin1 });
            await this.interactor.finalizeWhitelistForMint(rest[1], true, { from: admin1 });

            await this.interactor.requestMint(new BN('10000'), { from: rest[0] });
            await this.interactor.requestMint(new BN('10000'), { from: rest[1] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
            await this.interactor.approveMint(rest[1], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[1], 0, { from: admin2 });

            await this.token.transfer(rest[1], new BN('10000'), { from: rest[0] });
            await this.token.transfer(rest[0], new BN('10000'), { from: rest[1] });

            await this.interactor.requestMint(new BN('10000'), { from: rest[0] });
            await this.interactor.requestMint(new BN('10000'), { from: rest[1] });
            await this.interactor.approveMint(rest[0], 1, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 1, { from: admin2 });
            await this.interactor.approveMint(rest[1], 1, { from: admin1 });
            await this.interactor.finalizeMint(rest[1], 1, { from: admin2 });

            await this.interactor.blacklist(rest[0], true, { from: admin2 });
            await this.interactor.blacklist(rest[1], true, { from: admin2 });
            await this.interactor.finalizeBlacklist(rest[0], true, { from: admin1 });
            await this.interactor.finalizeBlacklist(rest[1], true, { from: admin1 });

            await shouldFail.reverting(this.token.transfer(rest[1], new BN('10000'), { from: rest[0] }));
            await shouldFail.reverting(this.token.transfer(rest[0], new BN('10000'), { from: rest[1] }));

            await this.interactor.blacklist(rest[0], false, { from: admin2 });
            await this.interactor.blacklist(rest[1], false, { from: admin2 });
            await this.interactor.finalizeBlacklist(rest[0], false, { from: admin1 });
            await this.interactor.finalizeBlacklist(rest[1], false, { from: admin1 });

            await this.token.transfer(rest[1], new BN('10000'), { from: rest[0] });
            await this.token.transfer(rest[0], new BN('10000'), { from: rest[1] });
        });

        it('blacklist stop transferFrom process', async function() {
            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });
            await this.interactor.finalizeWhitelistForMint(rest[0], true, { from: admin1 });
            await this.interactor.finalizeWhitelistForMint(rest[1], true, { from: admin1 });

            await this.interactor.requestMint(new BN('10000'), { from: rest[0] });
            await this.interactor.requestMint(new BN('10000'), { from: rest[1] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
            await this.interactor.approveMint(rest[1], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[1], 0, { from: admin2 });

            await this.token.approve(rest[0], new BN('10000'), { from: rest[0] });
            await this.token.approve(rest[1], new BN('10000'), { from: rest[1] });

            await this.token.transferFrom(rest[0], rest[1], new BN('10000'), { from: rest[0] });
            await this.token.transferFrom(rest[1], rest[0], new BN('10000'), { from: rest[1] });

            await this.interactor.requestMint(new BN('10000'), { from: rest[0] });
            await this.interactor.requestMint(new BN('10000'), { from: rest[1] });
            await this.interactor.approveMint(rest[0], 1, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 1, { from: admin2 });
            await this.interactor.approveMint(rest[1], 1, { from: admin1 });
            await this.interactor.finalizeMint(rest[1], 1, { from: admin2 });

            await this.token.approve(rest[0], new BN('10000'), { from: rest[0] });
            await this.token.approve(rest[1], new BN('10000'), { from: rest[1] });

            await this.interactor.blacklist(rest[0], true, { from: admin2 });
            await this.interactor.blacklist(rest[1], true, { from: admin2 });
            await this.interactor.finalizeBlacklist(rest[0], true, { from: admin1 });
            await this.interactor.finalizeBlacklist(rest[1], true, { from: admin1 });

            await shouldFail.reverting(this.token.transferFrom(rest[0], rest[1], new BN('10000'), { from: rest[0] }));
            await shouldFail.reverting(this.token.transferFrom(rest[1], rest[0], new BN('10000'), { from: rest[1] }));

            await this.interactor.blacklist(rest[0], false, { from: admin2 });
            await this.interactor.blacklist(rest[1], false, { from: admin2 });
            await this.interactor.finalizeBlacklist(rest[0], false, { from: admin1 });
            await this.interactor.finalizeBlacklist(rest[1], false, { from: admin1 });

            this.token.transferFrom(rest[0], rest[1], new BN('10000'), { from: rest[0] });
            this.token.transferFrom(rest[1], rest[0], new BN('10000'), { from: rest[1] });
        });
    });
});