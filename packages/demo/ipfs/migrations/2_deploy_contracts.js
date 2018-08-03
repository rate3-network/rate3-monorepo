
const DocHistory = artifacts.require('./DocHistory.sol');
const IpfsDoc = artifacts.require('./IpfsDoc.sol');

module.exports = function (deployer, network, accounts) {
  return deployer
    .then(() => {
      return deployer.deploy(DocHistory);
    })
    .then(() => {
      return deployer.deploy(
        IpfsDoc,
        DocHistory.address,
      );
    });
};
