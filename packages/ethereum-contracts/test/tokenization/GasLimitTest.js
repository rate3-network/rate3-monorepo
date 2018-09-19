import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import { advanceBlock } from '../helpers/advanceToBlock';

const TokenizeTemplateToken = artifacts.require("./tokenization/TokenizeTemplateToken.sol");
const TokenizeTemplateInteractor = artifacts.require("./tokenization/TokenizeTemplateInteractor.sol");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

contract('Gas Limit Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    });

    const [owner, admin, anotherAdmin, ...rest] = accounts;

    describe('Test - check if not out of gas', function() {
        it('check TokenizeTemplateToken', async function() {
            this.token = await TokenizeTemplateToken.new({ from: owner });
            it('check TokenizeTemplateInteractor', async function() {
                this.interactor = await TokenizeTemplateInteractor.new(this.token.address, { from: owner });
            });
        });

        it('check BalanceModule', async function() {
            this.balanceModule = await BalanceModule.new({ from: owner });
        });

        it('check AllowanceModule', async function() {
            this.allowanceModule = await AllowanceModule.new({ from: owner });
        });

        it('check RegistryModule', async function() {
            this.registryModule = await RegistryModule.new({ from: owner });
        });
    });
});