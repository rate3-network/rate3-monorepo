'use strict';

import Stellar from 'stellar-sdk';

import AssetContracts from './contracts/AssetContracts.js';
import HashedTimelockContracts from './contracts/HashedTimelockContracts.js';

async function R3Stellar(serverURI) {

    //const passPhrase = Stellar.Networks[network];
    //Stellar.Network.use(new Stellar.Network(passPhrase));
    Stellar.Network.useTestNetwork();
    
    const stellar = new Stellar.Server(serverURI);

    const assetContracts = AssetContracts(stellar, Stellar);
    const hashedTimelockContracts = HashedTimelockContracts(stellar, Stellar);    

    return {
        stellar,
        Stellar,
        assetContracts,
        hashedTimelockContracts,
    };
}

module.exports = R3Stellar;
