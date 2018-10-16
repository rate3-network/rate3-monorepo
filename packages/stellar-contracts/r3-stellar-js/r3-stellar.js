import Stellar from 'stellar-sdk';

import AssetContracts from './contracts/AssetContracts.js';
import HashedTimelockContracts from './contracts/AssetContracts.js';

export async function R3Stellar(network, serverURI) {

    const passPhrase = Stellar.Networks[process.env.STELLAR_NETWORK];
    Stellar.Network.use(new Stellar.Network(passPhrase));
    
    const stellar = new Stellar.Server(serverURI);
    

    return {
        stellar,
        Stellar,
        AssetContracts(stellar, Stellar),
        HashedTimeLockContracts(stellar, Stellar),
    };

}

