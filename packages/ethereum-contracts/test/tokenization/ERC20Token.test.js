import { BN, constants, expectEvent, time, shouldFail } from 'openzeppelin-test-helpers';

const ModularToken = artifacts.require("./tokenization/tokens/ModularToken.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const RegistryModule = artifacts.require("./tokenization/modules/RegistryModule.sol");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

// ERC20 tests referenced from:
// https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/test/token/ERC20/ERC20.test.js

contract('ERC20 Token Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await time.advanceBlock();
    });

    const [_, owner, recipient, anotherAccount, ...rest] = accounts;

    beforeEach(async function () {
        // Initialize BaseProxy, BaseToken contracts.
        this.token = await ModularToken.new('BaseToken', 'BT', 18, { from: owner });

        this.balanceModule = await BalanceModule.new({ from: owner });
        this.allowanceModule = await AllowanceModule.new({ from: owner });
        this.registryModule = await RegistryModule.new({ from: owner });
        await this.balanceModule.transferOwnership(this.token.address, { from: owner });
        await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
        await this.registryModule.transferOwnership(this.token.address, { from: owner });
        await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
        await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
        await this.token.setRegistryModule(this.registryModule.address, { from: owner });

        // Mint some tokens for owner
        await this.token.mint(owner, new BN(100), { from: owner });
    });

    describe('total supply', function () {
        it('returns the total amount of tokens', async function () {
            (await this.token.totalSupply()).should.be.a.bignumber.equals(new BN(100));
        });
    });
    
    describe('balanceOf', function () {
        describe('when the requested account has no tokens', function () {
            it('returns zero', async function () {
                (await this.token.balanceOf(anotherAccount)).should.be.a.bignumber.equals(new BN(0));
            });
        });
        describe('when the requested account has some tokens', function () {
            it('returns the total amount of tokens', async function () {
                (await this.token.balanceOf(owner)).should.be.a.bignumber.equals(new BN(100));
            });
        });
    });

    describe('transfer', function () {
        describe('when the recipient is not the zero address', function () {
            const to = recipient;

            describe('when the sender does not have enough balance', function () {
                const amount = new BN(101);

                it('reverts', async function () {
                    await shouldFail.reverting(this.token.transfer(to, amount, { from: owner }));
                });
            });
    
            describe('when the sender has enough balance', function () {
                const amount = new BN(100);

                it('transfers the requested amount', async function () {
                    await this.token.transfer(to, amount, { from: owner });

                    (await this.token.balanceOf(owner)).should.be.a.bignumber.equals(new BN(0));

                    (await this.token.balanceOf(to)).should.be.a.bignumber.equals(amount);
                });

                it('emits a transfer event', async function () {
                    const { logs } = await this.token.transfer(to, amount, { from: owner });

                    const event = expectEvent.inLogs(logs, 'Transfer', {
                        from: owner,
                        to: to,
                    });

                    event.args.value.should.be.a.bignumber.equals(amount);
                });
            });
        });
    
        describe('when the recipient is the zero address', function () {
            const to = constants.ZERO_ADDRESS;

            it('reverts', async function () {
                await shouldFail.reverting(this.token.transfer(to, new BN(100), { from: owner }));
            });
        });
    });

    describe('approve', function () {
        describe('when the spender is not the zero address', function () {
            const spender = recipient;

            describe('when the sender has enough balance', function () {
                const amount = new BN(100);

                it('emits an approval event', async function () {
                    const { logs } = await this.token.approve(spender, amount, { from: owner });

                    logs.length.should.equal(1);
                    logs[0].event.should.equal('Approval');
                    logs[0].args.owner.should.equal(owner);
                    logs[0].args.spender.should.equal(spender);
                    logs[0].args.value.should.be.a.bignumber.equals(amount);
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.token.approve(spender, amount, { from: owner });

                        (await this.token.allowance(owner, spender)).should.be.a.bignumber.equals(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, new BN(1), { from: owner });
                    });

                    it('approves the requested amount and replaces the previous one', async function () {
                        await this.token.approve(spender, amount, { from: owner });

                        (await this.token.allowance(owner, spender)).should.be.a.bignumber.equals(amount);
                    });
                });
            });

            describe('when the sender does not have enough balance', function () {
                const amount = new BN(101);

                it('emits an approval event', async function () {
                    const { logs } = await this.token.approve(spender, amount, { from: owner });

                    logs.length.should.equal(1);
                    logs[0].event.should.equal('Approval');
                    logs[0].args.owner.should.equal(owner);
                    logs[0].args.spender.should.equal(spender);
                    logs[0].args.value.should.be.a.bignumber.equals(amount);
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.token.approve(spender, amount, { from: owner });

                        (await this.token.allowance(owner, spender)).should.be.a.bignumber.equals(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, new BN(1), { from: owner });
                    });

                    it('approves the requested amount and replaces the previous one', async function () {
                        await this.token.approve(spender, amount, { from: owner });

                        (await this.token.allowance(owner, spender)).should.be.a.bignumber.equals(amount);
                    });
                });
            });
        });

        describe('when the spender is the zero address', function () {
            const amount = new BN(100);
            const spender = constants.ZERO_ADDRESS;

            it('reverts', async function () {
                await shouldFail.reverting(this.token.approve(spender, amount, { from: owner }));
            });
        });
    });
    
    describe('transfer from', function () {
        const spender = recipient;
    
        describe('when the recipient is not the zero address', function () {
            const to = anotherAccount;

            describe('when the spender has enough approved balance', function () {
                beforeEach(async function () {
                    await this.token.approve(spender, new BN(100), { from: owner });
                });

                describe('when the owner has enough balance', function () {
                    const amount = new BN(100);

                    it('transfers the requested amount', async function () {
                        await this.token.transferFrom(owner, to, amount, { from: spender });

                        (await this.token.balanceOf(owner)).should.be.a.bignumber.equals(new BN(0));

                        (await this.token.balanceOf(to)).should.be.a.bignumber.equals(amount);
                    });

                    it('decreases the spender allowance', async function () {
                        await this.token.transferFrom(owner, to, amount, { from: spender });

                        (await this.token.allowance(owner, spender)).should.be.a.bignumber.equals(new BN(0));
                    });

                    it('emits a transfer event', async function () {
                        const { logs } = await this.token.transferFrom(owner, to, amount, { from: spender });

                        logs.length.should.equal(1);
                        logs[0].event.should.equal('Transfer');
                        logs[0].args.from.should.equal(owner);
                        logs[0].args.to.should.equal(to);
                        logs[0].args.value.should.be.a.bignumber.equals(amount);
                    });
                });

                describe('when the owner does not have enough balance', function () {
                    const amount = new BN(101);

                    it('reverts', async function () {
                        await shouldFail.reverting(this.token.transferFrom(owner, to, amount, { from: spender }));
                    });
                });
            });

            describe('when the spender does not have enough approved balance', function () {
                beforeEach(async function () {
                    await this.token.approve(spender, new BN(99), { from: owner });
                });

                describe('when the owner has enough balance', function () {
                    const amount = new BN(100);

                    it('reverts', async function () {
                        await shouldFail.reverting(this.token.transferFrom(owner, to, amount, { from: spender }));
                    });
                });

                describe('when the owner does not have enough balance', function () {
                    const amount = new BN(101);

                    it('reverts', async function () {
                        await shouldFail.reverting(this.token.transferFrom(owner, to, amount, { from: spender }));
                    });
                });
            });
        });
    
        describe('when the recipient is the zero address', function () {
            const amount = new BN(100);
            const to = constants.ZERO_ADDRESS;

            beforeEach(async function () {
                await this.token.approve(spender, amount, { from: owner });
            });

            it('reverts', async function () {
                await shouldFail.reverting(this.token.transferFrom(owner, to, amount, { from: spender }));
            });
        });
    });
    
    describe('decrease approval', function () {
        describe('when the spender is not the zero address', function () {
            const spender = recipient;

            function shouldDecreaseApproval (amount) {
                describe('when the spender had an approved amount', function () {
                    const approvedAmount = amount;

                    beforeEach(async function () {
                        ({ logs: this.logs } = await this.token.approve(spender, approvedAmount, { from: owner }));
                    });

                    it('emits an approval event', async function () {
                        const { logs } = await this.token.decreaseApproval(spender, approvedAmount, { from: owner });

                        logs.length.should.equal(1);
                        logs[0].event.should.equal('Approval');
                        logs[0].args.owner.should.equal(owner);
                        logs[0].args.spender.should.equal(spender);
                        logs[0].args.value.should.be.a.bignumber.equals(new BN(0));
                    });

                    it('decreases the spender allowance subtracting the requested amount', async function () {
                        await this.token.decreaseApproval(spender, approvedAmount.sub(new BN(1)), { from: owner });

                        (await this.token.allowance(owner, spender)).should.be.a.bignumber.equals(new BN(1));
                    });

                    it('sets the allowance to zero when all allowance is removed', async function () {
                        await this.token.decreaseApproval(spender, approvedAmount, { from: owner });
                        (await this.token.allowance(owner, spender)).should.be.a.bignumber.equals(new BN(0));
                    });
                });
            }

            describe('when the sender has enough balance', function () {
                const amount = new BN(100);

                shouldDecreaseApproval(amount);
            });

            describe('when the sender does not have enough balance', function () {
                const amount = new BN(101);

                shouldDecreaseApproval(amount);
            });
        });

        describe('when the spender is the zero address', function () {
            const amount = new BN(100);
            const spender = constants.ZERO_ADDRESS;

            it('reverts', async function () {
                await shouldFail.reverting(this.token.decreaseApproval(spender, amount, { from: owner }));
            });
        });
    });
    
    describe('increase approval', function () {
        const amount = new BN(100);
    
        describe('when the spender is not the zero address', function () {
            const spender = recipient;

            describe('when the sender has enough balance', function () {
                it('emits an approval event', async function () {
                    const { logs } = await this.token.increaseApproval(spender, amount, { from: owner });

                    logs.length.should.equal(1);
                    logs[0].event.should.equal('Approval');
                    logs[0].args.owner.should.equal(owner);
                    logs[0].args.spender.should.equal(spender);
                    logs[0].args.value.should.be.a.bignumber.equals(amount);
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.token.increaseApproval(spender, amount, { from: owner });

                        (await this.token.allowance(owner, spender)).should.be.a.bignumber.equals(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, new BN(1), { from: owner });
                    });

                    it('increases the spender allowance adding the requested amount', async function () {
                        await this.token.increaseApproval(spender, amount, { from: owner });

                        (await this.token.allowance(owner, spender)).should.be.a.bignumber.equals(amount.add(new BN(1)));
                    });
                });
            });

            describe('when the sender does not have enough balance', function () {
                const amount = new BN(101);

                it('emits an approval event', async function () {
                    const { logs } = await this.token.increaseApproval(spender, amount, { from: owner });

                    logs.length.should.equal(1);
                    logs[0].event.should.equal('Approval');
                    logs[0].args.owner.should.equal(owner);
                    logs[0].args.spender.should.equal(spender);
                    logs[0].args.value.should.be.a.bignumber.equals(amount);
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.token.increaseApproval(spender, amount, { from: owner });

                        (await this.token.allowance(owner, spender)).should.be.a.bignumber.equals(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, new BN(1), { from: owner });
                    });

                    it('increases the spender allowance adding the requested amount', async function () {
                        await this.token.increaseApproval(spender, amount, { from: owner });

                        (await this.token.allowance(owner, spender)).should.be.a.bignumber.equals(amount.add(new BN(1)));
                    });
                });
            });
        });
    
        describe('when the spender is the zero address', function () {
            const spender = constants.ZERO_ADDRESS;

            it('reverts', async function () {
                await shouldFail.reverting(this.token.increaseApproval(spender, amount, { from: owner }));
            });
        });
    });    
});