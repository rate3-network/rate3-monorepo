/*
The code is refered from the following links
https://www.npmjs.com/package/stellar-hd-wallet for account creation
https://www.npmjs.com/package/node-forge for encryption, decryption
https://www.stellar.org/developers/guides/ for uploading accounts to testnet, transaction
*/

const stellarHDWallet = require('stellar-hd-wallet') 
const forge = require('node-forge');
const fs = require('fs');
const StellarSdk = require('stellar-sdk');
const bip39 = require('bip39')

/**
 * This is a wrapper class over stellar and ethereum
 */
class wallet_manager{
    constructor(network) {
        if (network == 'stellar') {
            this.network = 'stellar'
        } else if (network == 'ethereum') {
            this.network = 'ethereum'
        } else {
            console.log('The name of the network must be stellar or ethereum.')
        }
    }

    changeNetwork(network) {
        if (network == 'stellar') {
            this.network = 'stellar'
            console.log('Current network is stellar.')
        } else if (network == 'ethereum') {
            this.network = 'ethereum'
            console.log('Current network is ethereum.')
        } else {
            console.log('The name of the network must be stellar or ethereum.')
        }
    }

    setSeed() {
        if(this.network == 'stellar') {
            this.seed = stellarHDWallet.generateMnemonic();
            console.log(this.seed)
        } else if (this.network == 'ethereum') {
            this.seed = bip39.generateMnemonic()
            console.log(this.seed)
        } else {
            console.log('The network has not been set.')
        }
    }

    getSeed() {
        console.log(this.seed)
    }

    setWallet(mnemonic) {
        return stellarHDWallet.fromMnemonic(mnemonic)
    }

    //set
}

let acc = new account('ethereum')
acc.setSeed()
acc.getSeed()

