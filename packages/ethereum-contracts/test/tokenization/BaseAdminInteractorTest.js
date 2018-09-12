import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import { advanceBlock } from '../helpers/advanceToBlock';

const TokenizeTemplateToken = artifacts.require("./tokenization/TokenizeTemplateToken.sol");
const BaseAdminInteractor = artifacts.require("./tokenization/interactors/BaseAdminInteractor.sol");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

contract('BaseAdminInteractor Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    });

    const [owner, admin, anotherAdmin, ...rest] = accounts;

    describe('Test - set admin', function() {
        beforeEach(async function() {
            this.token = await TokenizeTemplateToken.new({ from: owner });
            this.interactor = await BaseAdminInteractor.new(this.token.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
        });

        it('only owner can set admin', async function() {
            await this.interactor.setFirstAdmin(admin, { from: admin }).should.be.rejected;
            await this.interactor.setFirstAdmin(admin, { from: owner }).should.be.fulfilled;

            await this.interactor.setSecondAdmin(admin, { from: admin }).should.be.rejected;
            await this.interactor.setSecondAdmin(admin, { from: owner }).should.be.fulfilled;
        });

        it('set admin actually works', async function() {
            await this.interactor.setFirstAdmin(admin, { from: owner });
            const admin1 = await this.interactor.admin1();
            admin1.should.be.equal(admin);
            await this.interactor.setFirstAdmin(anotherAdmin, { from: owner });
            const admin1_after = await this.interactor.admin1();
            admin1_after.should.be.equal(anotherAdmin);

            await this.interactor.setSecondAdmin(admin, { from: owner });
            const admin2 = await this.interactor.admin2();
            admin2.should.be.equal(admin);
            await this.interactor.setSecondAdmin(anotherAdmin, { from: owner });
            const admin2_after = await this.interactor.admin2();
            admin2_after.should.be.equal(anotherAdmin);
        });
    });

    describe('Test - set token contract', function() {
        beforeEach(async function() {
            this.token = await TokenizeTemplateToken.new({ from: owner });
            this.interactor = await BaseAdminInteractor.new(this.token.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setFirstAdmin(admin, { from: owner });
            await this.interactor.setSecondAdmin(anotherAdmin, { from: owner });
        });

        it('only owner can set token contract', async function() {
            await this.interactor.setToken(this.token.address, { from: admin }).should.be.rejected;
            await this.interactor.setToken(this.token.address, { from: anotherAdmin }).should.be.rejected;
            await this.interactor.setToken(this.token.address, { from: owner }).should.be.fulfilled;
        });

        it('set token contract actually works', async function() {
            const anotherToken = await TokenizeTemplateToken.new({ from: owner });
            const token1 = await this.interactor.token();
            token1.should.be.equal(this.token.address);
            await anotherToken.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(anotherToken.address, { from: owner });
            const token2 = await this.interactor.token();
            token2.should.be.equal(anotherToken.address);
        });

        it('only owner can claim token ownership', async function() {
            await this.interactor.setToken(this.token.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: admin }).should.be.rejected;
            await this.interactor.claimTokenOwnership({ from: anotherAdmin }).should.be.rejected;
            await this.interactor.claimTokenOwnership({ from: owner }).should.be.fulfilled;
        });
    });
});