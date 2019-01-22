import { BN, constants, expectEvent, time, shouldFail } from 'openzeppelin-test-helpers';

const PausableMock = artifacts.require('./lib/lifecycle/PausableMock');

require('chai')
  .use(require('chai-bn')(BN))
  .should();

contract('Pausable', function () {
  beforeEach(async function () {
    this.Pausable = await PausableMock.new();
  });

  it('can perform normal process in non-pause', async function () {
    (await this.Pausable.count()).should.be.a.bignumber.equals(new BN(0));

    await this.Pausable.normalProcess();
    (await this.Pausable.count()).should.be.a.bignumber.equals(new BN(1));
  });

  it('can not perform normal process in pause', async function () {
    await this.Pausable.pause();
    (await this.Pausable.count()).should.be.bignumber.equals(new BN(0));

    await shouldFail.reverting(this.Pausable.normalProcess());
    (await this.Pausable.count()).should.be.bignumber.equals(new BN(0));
  });

  it('can not take drastic measure in non-pause', async function () {
    await shouldFail.reverting(this.Pausable.drasticMeasure());
    (await this.Pausable.drasticMeasureTaken()).should.equal(false);
  });

  it('can take a drastic measure in a pause', async function () {
    await this.Pausable.pause();
    await this.Pausable.drasticMeasure();
    (await this.Pausable.drasticMeasureTaken()).should.equal(true);
  });

  it('should resume allowing normal process after pause is over', async function () {
    await this.Pausable.pause();
    await this.Pausable.unpause();
    await this.Pausable.normalProcess();
    (await this.Pausable.count()).should.be.a.bignumber.equals(new BN(1));
  });

  it('should prevent drastic measure after pause is over', async function () {
    await this.Pausable.pause();
    await this.Pausable.unpause();

    await shouldFail.reverting(this.Pausable.drasticMeasure());

    (await this.Pausable.drasticMeasureTaken()).should.equal(false);
  });

  it('should log Pause and Unpause events appropriately', async function () {
    const setPauseLogs = (await this.Pausable.pause()).logs;
    expectEvent.inLogs(setPauseLogs, 'Paused');

    const setUnPauseLogs = (await this.Pausable.unpause()).logs;
    expectEvent.inLogs(setUnPauseLogs, 'Unpaused');
  });
});