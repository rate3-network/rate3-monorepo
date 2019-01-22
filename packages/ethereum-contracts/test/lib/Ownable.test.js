import { BN, constants, expectEvent, time, shouldFail } from 'openzeppelin-test-helpers';

const Ownable = artifacts.require('./lib/ownership/Ownable');

contract('Ownable', function (accounts) {
  beforeEach(async function () {
    this.ownable = await Ownable.new();
  });

  shouldBehaveLikeOwnable(accounts);
});

require('chai')
  .should();

function shouldBehaveLikeOwnable (accounts) {
  describe('as an ownable', function () {
    it('should have an owner', async function () {
      const owner = await this.ownable.owner();
      owner.should.not.eq(constants.ZERO_ADDRESS);
    });

    it('changes owner after transfer', async function () {
      const other = accounts[1];
      await this.ownable.transferOwnership(other);
      const owner = await this.ownable.owner();

      owner.should.eq(other);
    });

    it('should prevent non-owners from transfering', async function () {
      const other = accounts[2];
      const owner = await this.ownable.owner.call();
      owner.should.not.eq(other);
      await shouldFail.reverting(this.ownable.transferOwnership(other, { from: other }));
    });

    it('should guard ownership against stuck state', async function () {
      const originalOwner = await this.ownable.owner();
      await shouldFail.reverting(this.ownable.transferOwnership(constants.ZERO_ADDRESS, { from: originalOwner }));
    });
  });
}

module.exports = {
  shouldBehaveLikeOwnable,
};