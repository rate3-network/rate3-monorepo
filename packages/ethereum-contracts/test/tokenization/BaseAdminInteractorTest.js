import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import { advanceBlock } from '../helpers/advanceToBlock';

const TokenizeTemplateToken = artifacts.require("./tokenization/TokenizeTemplateToken");
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
            await this.interactor.setAdmin(admin, { from: admin }).should.be.rejected;
            await this.interactor.setAdmin(admin, { from: owner }).should.be.fulfilled;
        });

        it('set admin actually works', async function() {
            await this.interactor.setAdmin(admin, { from: owner });
            const admin1 = await this.interactor.admin();
            admin1.should.be.equal(admin);
            await this.interactor.setAdmin(anotherAdmin, { from: owner });
            const admin2 = await this.interactor.admin();
            admin2.should.be.equal(anotherAdmin);
        });
    });

    describe('Test - set token contract', function() {
        beforeEach(async function() {
            this.token = await TokenizeTemplateToken.new({ from: owner });
            this.interactor = await BaseAdminInteractor.new(this.token.address, { from: owner });

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setAdmin(admin, { from: owner });
        });

        it('only owner can set token contract', async function() {
            await this.interactor.setToken(this.token.address, { from: admin }).should.be.rejected;
            await this.interactor.setToken(this.token.address, { from: owner }).should.be.fulfilled;
        });

        it('set token contract actually works', async function() {
            const anotherToken = await TokenizeTemplateToken.new({ from: owner });
            const token1 = await this.interactor.token();
            token1.should.be.equal(this.token.address);
            await this.interactor.setToken(anotherToken.address, { from: owner });
            const token2 = await this.interactor.token();
            token2.should.be.equal(anotherToken.address);
        });
    });
});

