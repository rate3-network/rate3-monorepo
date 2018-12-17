/* tslint:disable:import-name function-name */
import Stellar from 'stellar-sdk';
import AssetContracts from './contracts/AssetContracts.js';
import HashedTimelockContracts from './contracts/HashedTimelockContracts.js';
interface IReturn {
  stellar: any;
  Stellar: typeof Stellar;
  assetContracts: any;
  hashedTimelockContracts: any;
}
async function R3Stellar(network, serverURI) {

  const passPhrase = Stellar.Networks[network];
  Stellar.Network.use(new Stellar.Network(passPhrase));

  const stellar = new Stellar.Server(serverURI);

  const assetContracts = AssetContracts(stellar, Stellar);
  const hashedTimelockContracts = HashedTimelockContracts(stellar, Stellar);

  const result: IReturn = {
    stellar,
    Stellar,
    assetContracts,
    hashedTimelockContracts,
  };
  return result;
}

// module.exports = R3Stellar;
export default R3Stellar;
