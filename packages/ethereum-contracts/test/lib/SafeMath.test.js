import { BN, constants, expectEvent, time, shouldFail } from 'openzeppelin-test-helpers';

const SafeMathMock = artifacts.require('./lib/math/SafeMathMock');

require('chai')
  .use(require('chai-bn')(BN))
  .should();

contract('SafeMath', function () {
  beforeEach(async function () {
    this.safeMath = await SafeMathMock.new();
  });

  describe('add', function () {
    it('adds correctly', async function () {
      const a = new BN(5678);
      const b = new BN(1234);

      (await this.safeMath.add(a, b)).should.be.a.bignumber.equals(a.add(b));
    });

    it('throws a revert error on addition overflow', async function () {
      const a = constants.MAX_UINT256;
      const b = new BN(1);

      await shouldFail.reverting(this.safeMath.add(a, b));
    });
  });

  describe('sub', function () {
    it('subtracts correctly', async function () {
      const a = new BN(5678);
      const b = new BN(1234);

      (await this.safeMath.sub(a, b)).should.be.a.bignumber.equals(a.sub(b));
    });

    it('throws a revert error if subtraction result would be negative', async function () {
      const a = new BN(1234);
      const b = new BN(5678);

      await shouldFail.reverting(this.safeMath.sub(a, b));
    });
  });

  describe('mul', function () {
    it('multiplies correctly', async function () {
      const a = new BN(1234);
      const b = new BN(5678);

      (await this.safeMath.mul(a, b)).should.be.a.bignumber.equals(a.mul(b));
    });

    it('handles a zero product correctly', async function () {
      const a = new BN(0);
      const b = new BN(5678);

      (await this.safeMath.mul(a, b)).should.be.a.bignumber.equals(a.mul(b));
    });

    it('throws a revert error on multiplication overflow', async function () {
      const a = constants.MAX_UINT256;
      const b = new BN(2);

      await shouldFail.reverting(this.safeMath.mul(a, b));
    });
  });

  describe('div', function () {
    it('divides correctly', async function () {
      const a = new BN(5678);
      const b = new BN(5678);

      (await this.safeMath.div(a, b)).should.be.a.bignumber.equals(a.div(b));
    });

    it('throws a revert error on zero division', async function () {
      const a = new BN(5678);
      const b = new BN(0);

      await shouldFail.reverting(this.safeMath.div(a, b));
    });
  });

  describe('mod', function () {
    describe('modulos correctly', async function () {
      it('when the dividend is smaller than the divisor', async function () {
        const a = new BN(284);
        const b = new BN(5678);

        (await this.safeMath.mod(a, b)).should.be.a.bignumber.equals(a.mod(b));
      });

      it('when the dividend is equal to the divisor', async function () {
        const a = new BN(5678);
        const b = new BN(5678);

        (await this.safeMath.mod(a, b)).should.be.a.bignumber.equals(a.mod(b));
      });

      it('when the dividend is larger than the divisor', async function () {
        const a = new BN(7000);
        const b = new BN(5678);

        (await this.safeMath.mod(a, b)).should.be.a.bignumber.equals(a.mod(b));
      });

      it('when the dividend is a multiple of the divisor', async function () {
        const a = new BN(17034); // 17034 == 5678 * 3
        const b = new BN(5678);

        (await this.safeMath.mod(a, b)).should.be.a.bignumber.equals(a.mod(b));
      });
    });

    it('reverts with a 0 divisor', async function () {
      const a = new BN(5678);
      const b = new BN(0);

      await shouldFail.reverting(this.safeMath.mod(a, b));
    });
  });
});