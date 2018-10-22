'use strict';

import Stellar from 'stellar-sdk';

import AssetContracts from './contracts/AssetContracts.js';
import HashedTimelockContracts from './contracts/AssetContracts.js';

async function R3Stellar(serverURI) {

    //const passPhrase = Stellar.Networks[network];
    //Stellar.Network.use(new Stellar.Network(passPhrase));
    Stellar.Network.useTestNetwork();
    
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

module.exports = R3Stellar;
