import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import { advanceBlock } from '../helpers/advanceToBlock';

const TokenizeTemplateToken = artifacts.require("./tokenization/TokenizeTemplateToken.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const RegistryModule = artifacts.require("./tokenization/modules/RegistryModule.sol");
const TokenizeTemplateInteractor = artifacts.require("./tokenization/TokenizeTemplateInteractor.sol");

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
            this.token = await TokenizeTemplateToken.new({ from: owner });
            this.interactor = await TokenizeTemplateInteractor.new(this.token.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address);
            await this.token.setBalanceModule(this.balanceModule.address);
            await this.token.setRegistryModule(this.registryModule.address);

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

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
    });

    describe('Test - mint approve operations', function() {
        beforeEach(async function() {
            this.token = await TokenizeTemplateToken.new({ from: owner });
            this.interactor = await TokenizeTemplateInteractor.new(this.token.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address);
            await this.token.setBalanceModule(this.balanceModule.address);
            await this.token.setRegistryModule(this.registryModule.address);

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });
        });

        it('owner cannot approve mint request', async function() {
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: owner }).should.be.rejected;
        });

        it('admin1 can approve mint request', async function() {
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 }).should.be.fulfilled;
        });

        it('non-owner/admin2 cannot approve mint request', async function() {
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin2 }).should.be.rejected;
            await this.interactor.approveMint(rest[0], 0, { from: rest[0] }).should.be.rejected;
            await this.interactor.approveMint(rest[0], 0, { from: rest[1] }).should.be.rejected;
        });
    });

    describe('Test - mint finalize operations', function() {
        beforeEach(async function() {
            this.token = await TokenizeTemplateToken.new({ from: owner });
            this.interactor = await TokenizeTemplateInteractor.new(this.token.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address);
            await this.token.setBalanceModule(this.balanceModule.address);
            await this.token.setRegistryModule(this.registryModule.address);

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });
        });

        it('owner cannot finalize mint request', async function() {
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: owner }).should.be.rejected;
        });

        it('admin2 can finalize mint request', async function() {
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 }).should.be.fulfilled;
        });

        it('non-owner/admin1 cannot finalize mint request', async function() {
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin1 }).should.be.rejected;
            await this.interactor.finalizeMint(rest[0], 0, { from: rest[0] }).should.be.rejected;
            await this.interactor.finalizeMint(rest[0], 0, { from: rest[1] }).should.be.rejected;
        });
    });

    describe('Test - burn request operations', function() {
        beforeEach(async function() {
            this.token = await TokenizeTemplateToken.new({ from: owner });
            this.interactor = await TokenizeTemplateInteractor.new(this.token.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address);
            await this.token.setBalanceModule(this.balanceModule.address);
            await this.token.setRegistryModule(this.registryModule.address);

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[1], true, { from: admin2 });

            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] });
            await this.interactor.approveMint(rest[1], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[1], 0, { from: admin2 });
        });

        it('anyone can submit as many burn requests', async function() {
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] }).should.be.fulfilled;
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.fulfilled;
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[1] }).should.be.fulfilled;
        });

        it('burn requests are indexed', async function() {
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });

            await this.interactor.approveBurn(rest[0], 0, { from: admin1 }).should.be.fulfilled;
            await this.interactor.approveBurn(rest[0], 1, { from: admin1 }).should.be.fulfilled;
            await this.interactor.approveBurn(rest[0], 2, { from: admin1 }).should.be.fulfilled;
            await this.interactor.approveBurn(rest[0], new web3.BigNumber('3'), { from: admin1 }).should.be.fulfilled;
        });
    });

    describe('Test - burn approve operations', function() {
        beforeEach(async function() {
            this.token = await TokenizeTemplateToken.new({ from: owner });
            this.interactor = await TokenizeTemplateInteractor.new(this.token.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address);
            await this.token.setBalanceModule(this.balanceModule.address);
            await this.token.setRegistryModule(this.registryModule.address);

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[1], true, { from: admin2 });

            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] });
            await this.interactor.approveMint(rest[1], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[1], 0, { from: admin2 });
        });

        it('owner cannot approve burn request', async function() {
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveBurn(rest[0], 0, { from: owner }).should.be.rejected;
        });

        it('admin1 can approve burn request', async function() {
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 }).should.be.fulfilled;
        });

        it('non-owner/admin2 cannot approve burn request', async function() {
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveBurn(rest[0], 0, { from: admin2 }).should.be.rejected;
            await this.interactor.approveBurn(rest[0], 0, { from: rest[0] }).should.be.rejected;
            await this.interactor.approveBurn(rest[0], 0, { from: rest[1] }).should.be.rejected;
        });
    });

    describe('Test - burn finalize operations', function() {
        beforeEach(async function() {
            this.token = await TokenizeTemplateToken.new({ from: owner });
            this.interactor = await TokenizeTemplateInteractor.new(this.token.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address);
            await this.token.setBalanceModule(this.balanceModule.address);
            await this.token.setRegistryModule(this.registryModule.address);

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });

            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            await this.interactor.whitelistForMint(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForMint(rest[1], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[0], true, { from: admin2 });
            await this.interactor.whitelistForBurn(rest[1], true, { from: admin2 });

            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[0], 0, { from: admin2 });
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[1] });
            await this.interactor.approveMint(rest[1], 0, { from: admin1 });
            await this.interactor.finalizeMint(rest[1], 0, { from: admin2 });
        });

        it('owner cannot finalize burn request', async function() {
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeBurn(rest[0], 0, { from: owner }).should.be.rejected;
        });

        it('admin2 can finalize burn request', async function() {
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin2 }).should.be.fulfilled;
        });

        it('non-owner/admin1 cannot finalize mint request', async function() {
            await this.interactor.requestBurn(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveBurn(rest[0], 0, { from: admin1 });
            await this.interactor.finalizeBurn(rest[0], 0, { from: admin1 }).should.be.rejected;
            await this.interactor.finalizeBurn(rest[0], 0, { from: rest[0] }).should.be.rejected;
            await this.interactor.finalizeBurn(rest[0], 0, { from: rest[1] }).should.be.rejected;
        });
    });
});