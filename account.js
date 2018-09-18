/*
The code is refered from the following links
https://www.npmjs.com/package/stellar-hd-wallet for account creation
https://www.npmjs.com/package/node-forge for encryption, decryption
https://www.stellar.org/developers/guides/ for uploading accounts to testnet, transaction
*/

const bip39 = require('bip39')
const forge = require('node-forge');
const fs = require('fs');
const stellarHDWallet = require('stellar-hd-wallet') 
const StellarSdk = require('stellar-sdk');
const ethereum_wallet = require('ethereumjs-wallet')
const ethUtil = require('ethereumjs-util');
const tx = require('ethereumjs-tx');
var Web3 = require('web3');
var web3 = new Web3("https://rinkeby.infura.io/v3/54add33f289d4856968099c7dff630a7");

/**
 * This is a wrapper class over stellar and ethereum accounts.
 * For those fields/methods that are already there when the original
 * account is passed in, this class simply extracts them;
 * Otherwise, the fields/methods are created and saved in this class. 
 */
class account{
    constructor(network) {
        if (network == 'stellar') {
            this.network = 'stellar'
        } else if (network == 'ethereum') {
            this.network = 'ethereum'
        } else {
            console.log('The name of the network must be stellar or ethereum.')
        }
    }

    /**
     * 
     * @param {object} account - A stellar or ethereum account
     */
    setAccount (account) {
        if (this.network == null) {
            console.log('The network of this account must be set first.')
            return null
        } else {
            this.account = account
            return this.account
        }
    }

    /**
     * Return the network where the account is.
     */
    getNetwork() {
        return this.network
    }

    /**
     * Get the account that is passed into this wrapper class.
     */
    getOriginalAccount() {
        return this.account
    }

    /**
     * The address of a stellar account is the public key of the key pair;
     * The address of an ethereum account is a part of the hash of the public key
     */
    getAddress() {
        switch(this.network) {
            case 'stellar':
                return this.account.publicKey()
            case 'ethereum':
                return this.account.address
            default:
                return null //If the network is not set correctly
        }
    }

    getPrivateKey() {
        switch(this.network) {
            case 'stellar':
                return this.account.secret()
            case 'ethereum':
                return this.account.privateKey
            default:
                return null //If the network is not set correctly
        }
    }

}

module.exports = account