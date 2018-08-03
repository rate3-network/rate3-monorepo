import _filter from 'lodash/filter';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiBigNumber from 'chai-bignumber';
import bs58 from 'bs58';

import { advanceBlock } from './helpers/advanceToBlock';

const DocHistory = artifacts.require('./DocHistory.sol');
const IpfsDoc = artifacts.require('./IpfsDoc.sol');

chai.use(chaiAsPromised).use(chaiBigNumber(web3.BigNumber)).should();

const getEvent = (contract, filter) => {
  return new Promise((resolve) => {
    const event = contract[filter.event]();
    event.watch();
    event.get((error, logs) => {
      const filtered = _filter(logs, filter);
      if (filtered) {
        resolve(filtered);
      } else {
        throw Error('Failed to find filtered event for ' + filter.event);
      }
    });
    event.stopWatching();
  });
};

// Assumes the command: ganache-cli -e 100000
// 100000 default ether, 10 accounts created
contract('Ipfs Doc History', function (accounts) {

  // Testnet account labelling
  const ownerWallet = accounts[0];
  const testWallet1 = accounts[8];
  const testWallet2 = accounts[9];

  // base-58 hash
  const ipfsHash = 'QmXfz4jMCuYrU7rXAUE2KR9qfdn2uvEGHoBaqjxxHtKnyD';

  const args = {
    // Convert to hexadecimal
    docHash: parseInt(bs58.decode(ipfsHash).toString('hex'), 16),
    docTypeId: 0,
    recipient: testWallet1,
  };

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  describe('add doc flow', function () {
    beforeEach(async function () {
      this.docHistory = await DocHistory.new();
      this.IpfsDoc = await IpfsDoc.new(this.docHistory.address);
    });

    it('should reject if not whitelisted', async function () {
      await this.IpfsDoc.Submit(
        args.docHash,
        args.docTypeId,
        args.recipient,
      ).should.be.rejected;
    });

    it('should allow adding of doc types', async function () {
      await this.docHistory.addDocType('ID').should.be.fulfilled;
      await this.docHistory.addDocType('Bill').should.be.fulfilled;
    });

    describe('when whitelisted', function () {
      beforeEach(async function () {
        await this.docHistory.addAddressToWhitelist(this.IpfsDoc.address);
      });

      it('should reject if invalid docTypeId', async function () {
        await this.IpfsDoc.Submit(
          args.docHash,
          args.docTypeId,
          args.recipient,
        ).should.be.rejected;
      });

      describe('with docTypes added', function () {
        beforeEach(async function () {
          await this.docHistory.addDocType('ID');
          await this.docHistory.addDocType('Bill');
        });

        it('should allow doc submission', async function () {
          await this.IpfsDoc.Submit(
            args.docHash,
            args.docTypeId,
            args.recipient,
          ).should.be.fulfilled;
        });

        it('should emit event when submitted', async function() {
          await this.IpfsDoc.Submit(
            args.docHash,
            args.docTypeId,
            args.recipient,
          );
          const logs = await getEvent(this.docHistory, { event: 'DocAdded' });
          logs.should.have.a.lengthOf(1);

          const {
            docHash,
            docTypeId,
            recipient,
          } = logs[0].args;
          web3.toDecimal(docHash).should.be.equal(args.docHash);
          docTypeId.toString(10).should.be.equal(web3.toBigNumber(args.docTypeId).toString(10));
          recipient.should.be.equal(args.recipient);
        });
      });
    });
  });
});
