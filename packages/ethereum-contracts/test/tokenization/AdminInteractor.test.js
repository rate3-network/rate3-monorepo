import { BN, constants, expectEvent, time, shouldFail } from 'openzeppelin-test-helpers';

const AdminInteractor = artifacts.require("./tokenization/interactors/AdminInteractor.sol");
const BaseProxy = artifacts.require("./tokenization/BaseProxy.sol");
const BaseToken = artifacts.require("./tokenization/BaseToken.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const RegistryModule = artifacts.require("./tokenization/modules/RegistryModule.sol");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract('AdminInteractor Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await time.advanceBlock();
    });
    /**
     * Roles
     */
    const [owner, admin1, admin2, ...rest] = accounts;

    describe('Test - set admin', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and AdminInteractor contracts.
            this.token = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
            this.proxy = await BaseProxy.new(this.token.address, { from: owner });
            this.interactor = await AdminInteractor.new(this.token.address, this.proxy.address, { from: owner });
        });

        it('only owner can set admin', async function() {
            // Non-admins cannot set themselves to be admin.
            await shouldFail.reverting(this.interactor.setFirstAdmin(admin1, { from: admin1 }));
            await this.interactor.setFirstAdmin(admin1, { from: owner });

            await shouldFail.reverting(this.interactor.setSecondAdmin(admin2, { from: admin2 }));
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // Existing admins cannot set admins either.
            await shouldFail.reverting(this.interactor.setSecondAdmin(rest[0], { from: admin2 }));
        });

        it('set admin actually works', async function() {
            // Set First and Second admins to see if admin addressed are actually changed.
            await this.interactor.setFirstAdmin(admin1, { from: owner });
            let admin = await this.interactor.admin1();
            admin.should.be.equal(admin1);
            await this.interactor.setFirstAdmin(rest[0], { from: owner });
            admin = await this.interactor.admin1();
            admin.should.be.equal(rest[0]);

            await this.interactor.setSecondAdmin(admin2, { from: owner });
            admin = await this.interactor.admin2();
            admin.should.be.equal(admin2);
            await this.interactor.setSecondAdmin(rest[0], { from: owner });
            admin = await this.interactor.admin2();
            admin.should.be.equal(rest[0]);
        });

        it('set first admin event emitted', async function() {
            const { logs } = await this.interactor.setFirstAdmin(admin1, { from: owner });

            const event1 = expectEvent.inLogs(logs, 'FirstAdminSet', {
                from: owner,
                to: admin1,
            });
        })

        it('set second admin event emitted', async function() {
            const { logs } = await this.interactor.setSecondAdmin(admin2, { from: owner });

            const event2 = expectEvent.inLogs(logs, 'SecondAdminSet', {
                from: owner,
                to: admin2,
            });
        })
    });

    describe('Test - set token contract', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and AdminInteractor contracts.
            this.token = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
            this.proxy = await BaseProxy.new(this.token.address, { from: owner });
            this.interactor = await AdminInteractor.new(this.token.address, this.proxy.address, { from: owner });

            // Setup admins
            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });
        });

        it('only owner can set token contract', async function() {
            await shouldFail.reverting(this.interactor.setToken(this.token.address, { from: admin1 }));
            await shouldFail.reverting(this.interactor.setToken(this.token.address, { from: admin2 }));
            await this.interactor.setToken(this.token.address, { from: owner });
        });

        it('set token contract actually works', async function() {
            // Deploy another BaseToken contract
            const anotherToken = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
            const token1 = await this.interactor.token();
            token1.should.be.equal(this.token.address);
            await this.interactor.setToken(anotherToken.address, { from: owner });
            const token2 = await this.interactor.token();
            token2.should.be.equal(anotherToken.address);
        });

        it('only owner can claim token ownership', async function() {
            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setToken(this.token.address, { from: owner });
            await shouldFail.reverting(this.interactor.claimTokenOwnership({ from: admin1 }));
            await shouldFail.reverting(this.interactor.claimTokenOwnership({ from: admin2 }));
            await this.interactor.claimTokenOwnership({ from: owner });
        });

        it('can only claim token ownership after the ownership actually transferred', async function() {
            await this.interactor.setToken(this.token.address, { from: owner });
            await shouldFail.reverting(this.interactor.claimTokenOwnership({ from: owner }));

            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });
        });

        it('set token contract event emitted', async function() {
            const { logs } = await this.interactor.setToken(this.token.address, { from: owner });

            const event1 = expectEvent.inLogs(logs, 'TokenSet', {
                from: this.token.address,
                to: this.token.address,
            });
        })
    });

    describe('Test - set proxy contract', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and AdminInteractor contracts.
            this.token = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
            this.proxy = await BaseProxy.new(this.token.address, { from: owner });
            this.interactor = await AdminInteractor.new(this.token.address, this.proxy.address, { from: owner });

            // Setup admins
            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });
        });

        it('only owner can set proxy contract', async function() {
            await shouldFail.reverting(this.interactor.setProxy(this.token.address, { from: admin1 }));
            await shouldFail.reverting(this.interactor.setProxy(this.token.address, { from: admin2 }));
            await this.interactor.setProxy(this.token.address, { from: owner });
        });

        it('set proxy contract actually works', async function() {
            // Deploy another BaseProxy contract
            const anotherProxy = await BaseProxy.new(this.token.address, { from: owner });
            const proxy1 = await this.interactor.proxy();
            proxy1.should.be.equal(this.proxy.address);
            await this.interactor.setProxy(anotherProxy.address, { from: owner });
            const proxy2 = await this.interactor.proxy();
            proxy2.should.be.equal(anotherProxy.address);
        });

        it('only owner can claim proxy ownership', async function() {
            await this.proxy.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.setProxy(this.proxy.address, { from: owner });
            await shouldFail.reverting(this.interactor.claimProxyOwnership({ from: admin1 }));
            await shouldFail.reverting(this.interactor.claimProxyOwnership({ from: admin2 }));
            await this.interactor.claimProxyOwnership({ from: owner });
        });

        it('can only claim proxy ownership after the ownership actually transferred', async function() {
            await this.interactor.setProxy(this.proxy.address, { from: owner });
            await shouldFail.reverting(this.interactor.claimProxyOwnership({ from: owner }));

            await this.proxy.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.claimProxyOwnership({ from: owner });
        });

        it('set proxy contract event emitted', async function() {
            const { logs } = await this.interactor.setProxy(this.proxy.address, { from: owner });

            const event1 = expectEvent.inLogs(logs, 'ProxySet', {
                from: this.proxy.address,
                to: this.proxy.address,
            });
        })
    });

    describe('Test - set token on proxy', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and AdminInteractor contracts.
            this.token = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
            this.proxy = await BaseProxy.new(this.token.address, { from: owner });
            this.interactor = await AdminInteractor.new(this.token.address, this.proxy.address, { from: owner });

            // Setup admins
            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // Transfer and Claim ownership
            await this.proxy.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.claimProxyOwnership({ from: owner });
        });

        it('token should be owned by interactor', async function() {
            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await shouldFail.reverting(this.interactor.setTokenOnProxy(this.token.address, { from: owner }));

            await this.interactor.claimTokenOwnership({ from: owner });
            await this.interactor.setTokenOnProxy(this.token.address, { from: owner });
        });

        it('only owner can set token on proxy', async function() {
            await this.token.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.claimTokenOwnership({ from: owner });
            await shouldFail.reverting(this.interactor.setTokenOnProxy(this.token.address, { from: admin1 }));
            await shouldFail.reverting(this.interactor.setTokenOnProxy(this.token.address, { from: admin2 }));
            await this.interactor.setTokenOnProxy(this.token.address, { from: owner });
        });
    });

    describe('Test - set proxy on token', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and AdminInteractor contracts.
            this.token = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
            this.proxy = await BaseProxy.new(this.token.address, { from: owner });
            this.interactor = await AdminInteractor.new(this.token.address, this.proxy.address, { from: owner });

            // Setup admins
            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // Claim ownership
            await this.token.transferOwnership(this.interactor.address, { from: owner });   
            await this.interactor.claimTokenOwnership({ from: owner });
        });

        it('proxy should be owned by interactor', async function() {
            await this.proxy.transferOwnership(this.interactor.address, { from: owner });
            await shouldFail.reverting(this.interactor.setProxyOnToken(this.proxy.address, { from: owner }));

            await this.interactor.claimProxyOwnership({ from: owner });
            await this.interactor.setProxyOnToken(this.proxy.address, { from: owner });
        });

        it('only owner can set proxy on token', async function() {
            await this.proxy.transferOwnership(this.interactor.address, { from: owner });
            await this.interactor.claimProxyOwnership({ from: owner });
            await shouldFail.reverting(this.interactor.setProxyOnToken(this.proxy.address, { from: admin1 }));
            await shouldFail.reverting(this.interactor.setProxyOnToken(this.proxy.address, { from: admin2 }));
            await this.interactor.setProxyOnToken(this.proxy.address, { from: owner });
        });
    });

    describe('Test - transfer owned contract', function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and AdminInteractor contracts.
            this.token = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
            this.proxy = await BaseProxy.new(this.token.address, { from: owner });
            this.interactor = await AdminInteractor.new(this.token.address, this.proxy.address, { from: owner });

            // Setup admins
            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // Claim ownership
            await this.token.transferOwnership(this.interactor.address, { from: owner });   
            await this.interactor.claimTokenOwnership({ from: owner });
            await this.proxy.transferOwnership(this.interactor.address, { from: owner });   
            await this.interactor.claimProxyOwnership({ from: owner });
        });

        it('only owner can transfer ownership for interactor', async function() {
            await shouldFail.reverting(this.interactor.transferOwnedContract(this.proxy.address, rest[0], { from: rest[0] }));
            await shouldFail.reverting(this.interactor.transferOwnedContract(this.proxy.address, rest[0], { from: admin1 }));
            await shouldFail.reverting(this.interactor.transferOwnedContract(this.proxy.address, rest[0], { from: admin2 }));
            await this.interactor.transferOwnedContract(this.proxy.address, rest[0], { from: owner });

            // new owner can now claim ownership
            await this.proxy.claimOwnership({ from: rest[0] });

            // new owner should be reflected after claim
            const newOwner = await this.proxy.owner();
            newOwner.should.be.equal(rest[0]);
        });

        it('can only transfer ownership for interactor owned contracts', async function() {
            const anotherToken = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
            await shouldFail.reverting(this.interactor.transferOwnedContract(anotherToken.address, rest[0], { from: owner }));
        });
    });

    describe('Test - set modules', async function() {
        beforeEach(async function() {
            // Initialize BaseProxy, BaseToken and AdminInteractor contracts.
            this.token = await BaseToken.new('BaseToken', 'BT', 18, { from: owner });
            this.proxy = await BaseProxy.new(this.token.address, { from: owner });
            this.interactor = await AdminInteractor.new(this.token.address, this.proxy.address, { from: owner });

            // Setup admins
            await this.interactor.setFirstAdmin(admin1, { from: owner });
            await this.interactor.setSecondAdmin(admin2, { from: owner });

            // Claim ownership
            await this.token.transferOwnership(this.interactor.address, { from: owner });   
            await this.interactor.claimTokenOwnership({ from: owner });
            await this.proxy.transferOwnership(this.interactor.address, { from: owner });   
            await this.interactor.claimProxyOwnership({ from: owner });

            // Prepare modules contracts
            this.balanceModule = await BalanceModule.new({ from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
        });

        it('only owner can set modules', async function() {
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });   
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });   
            await this.registryModule.transferOwnership(this.token.address, { from: owner });   

            await shouldFail.reverting(this.interactor.setBalanceModule(this.balanceModule.address, { from: rest[0] }));
            await shouldFail.reverting(this.interactor.setAllowanceModule(this.allowanceModule.address, { from: rest[0] }));
            await shouldFail.reverting(this.interactor.setRegistryModule(this.registryModule.address, { from: rest[0] }));

            await this.interactor.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.interactor.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.interactor.setRegistryModule(this.registryModule.address, { from: owner });
        });

        it('module ownership needs to be transferred to token first', async function() {
            await shouldFail.reverting(this.interactor.setBalanceModule(this.balanceModule.address, { from: owner }));
            await shouldFail.reverting(this.interactor.setAllowanceModule(this.allowanceModule.address, { from: owner }));
            await shouldFail.reverting(this.interactor.setRegistryModule(this.registryModule.address, { from: owner }));

            await this.balanceModule.transferOwnership(this.token.address, { from: owner });   
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });   
            await this.registryModule.transferOwnership(this.token.address, { from: owner });   

            await this.interactor.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.interactor.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.interactor.setRegistryModule(this.registryModule.address, { from: owner });
        });
    });
});