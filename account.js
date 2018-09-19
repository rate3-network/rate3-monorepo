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
        var request = require('request');
        if (this.network == null) {
            console.log('The network of this account must be set first.')
            return null
        } else if (this.network == 'stellar') {
            //check if the account is already on testnet
            this.account = account
            this.balance = '-1'
            var self = this
            request('https://horizon-testnet.stellar.org' + '/accounts/' + this.getAddress(), function (error, response, body) {
                if (response.statusCode == 200) {
                    // the account is alreay on the testnet
                    // retrieve the balance value and set it here, in string
                    self.balance = JSON.parse(body).balances[0].balance
                } else {
                    //the account is not on the testnet
                    // load it to test net and then retrieve the balance
                    request.get({
                        url: 'https://friendbot.stellar.org',
                        qs: { addr: account.publicKey() },
                        json: true
                        }, function(error, response, body) {
                            if (error || response.statusCode !== 200) {
                                console.error('ERROR!', error || body);
                            }
                            else {
                                console.log('SUCCESS! You have a new account :)\n', body);
                                // retrieve the balance value and set it here
                                request('https://horizon-testnet.stellar.org' + '/accounts/' + account.publicKey(), function (error, response, body) {
                                    if (response.statusCode == 200) {
                                        self.balance = JSON.parse(body).balances[0].balance
                                    } else {
                                        console.log('error:', error)
                                    }
                                });
                            }
                    
                    });
                }
            });
        } else if (this.network == 'ethereum') {
            this.account = account
            this.balance = '-1'
            var self = this
            web3.eth.getBalance(account.address, function(err, val) {
                if (err != null) {
                    console.log('Cannot get the eth balance')
                } else {
                    self.balance = val
                }
            });
        } else {
            this.account = null
            console.log('The account network is not correctly set.')
        }
    }

    /**
     * Return the network where the account is.
     */
    getNetwork() {
        return this.network
    }

    getBalance() {
        return this.balance
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

// let wallet_manager_module = require('./wallet_manager')
// let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
// const wallet_manager = new wallet_manager_module('stellar')
// wallet_manager.setSeed(seed_phrases)
// wallet_manager.setWallet()
// let expectedPrivateKey = 'SDJNCBWIH4GU377ICXYL7NEI5Z2GWOR2Y3PAQVI2HJHJ7MSB42PP4KVW'
// let expectedPublicKey = 'GCDAFTYQTU2YVNPCJVIZ6IT2MKSL2KRY724ODR3Y5AJ5NZ2CD6Z7A7GO'
// let acc = wallet_manager.getAccount(13)
