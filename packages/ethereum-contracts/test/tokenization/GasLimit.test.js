import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import { advanceBlock } from '../helpers/advanceToBlock';

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

contract('Gas Limit Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    });

    const [owner, ...rest] = accounts;

    describe('Test - check if not out of gas', function() {
        it('check BaseToken', async function() {
            this.token = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
        });

        it('check BaseProxy', async function() {
            this.proxy = await BaseProxy.new(this.token.address, { from: owner });
        });

        it('check BaseInteractor', async function() {
            this.interactor = await BaseInteractor.new(this.token.address, this.proxy.address, { from: owner });
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