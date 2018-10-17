'use strict';

import Stellar from 'stellar-sdk';

import AssetContracts from './contracts/AssetContracts.js';
import HashedTimelockContracts from './contracts/AssetContracts.js';

export async function R3Stellar(network, serverURI) {

    const passPhrase = Stellar.Networks[process.env.STELLAR_NETWORK];
    Stellar.Network.use(new Stellar.Network(passPhrase));
    
    const stellar = new Stellar.Server(serverURI);

    const assetContracts = AssetContracts(stellar, Stellar);
    const hashedTimeLockContracts = HashedTimelockContracts(stellar, Stellar);    

    return {
        stellar,
        Stellar,
        assetContracts,
        hashedTimeLockContracts,
    };
}

