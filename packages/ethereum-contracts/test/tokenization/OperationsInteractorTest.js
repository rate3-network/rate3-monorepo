import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import { advanceBlock } from '../helpers/advanceToBlock';

const TokenizeTemplateToken = artifacts.require("./tokenization/TokenizeTemplateToken.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const OperationsInteractor = artifacts.require("./tokenization/interactors/OperationsInteractor.sol");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

contract('OperationsInteractor Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    });

    const [owner, admin, ...rest] = accounts;

    describe('Test - mint operations', function() {
        beforeEach(async function() {
            this.token = await TokenizeTemplateToken.new({ from: owner });
            this.interactor = await OperationsInteractor.new(this.token.address, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address);
            await this.token.setBalanceModule(this.balanceModule.address);

            await this.token.transferOwnership(this.interactor.address, { from: owner });

            await this.interactor.setAdmin(admin, { from: owner });
        });

        it('owner can approve mint request', async function() {
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: owner }).should.be.fulfilled;
        });

        it('admin can approve mint request', async function() {
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: admin }).should.be.fulfilled;
        });

        it('non-owner/admin cannot approve mint request', async function() {
            await this.interactor.requestMint(new web3.BigNumber('10000e+18'), { from: rest[0] });
            await this.interactor.approveMint(rest[0], 0, { from: rest[0] }).should.be.rejected;
            await this.interactor.approveMint(rest[0], 0, { from: rest[1] }).should.be.rejected;
        });
    });


});