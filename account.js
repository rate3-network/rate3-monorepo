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
            //).then((error, response, body) => {})
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

    sign(data) {
        if(this.network == 'stellar') {
            //sign
            if (this.account.canSign()) {
                
                return this.account.sign(data)//.toString()
            } else {
                console.log('The Stellar account does not contain a private key and cannot sign')
                return null
            }
        } else if (this.network == 'ethereum') {
            return web3.eth.accounts.sign(data, this.getPrivateKey())
        }
    }

    /**
     * Send an amount from the current account to another account
     * @param {string} to - the address that recerives XLM/ETH
     * @param {string} amount - the amount of XLM/ETH sent; e.g. 100XLM; 0.01 eth
     */
    send(to, amount) {
        if(this.network == 'stellar') {
            StellarSdk.Network.useTestNetwork();
            var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
            // Transaction will hold a built transaction we can resubmit if the result is unknown.
            var transaction;
            var self = this
            // First, check to make sure that the destination account exists.
            // You could skip this, but if the account does not exist, you will be charged
            // the transaction fee when the transaction fails.
            server.loadAccount(to)
              // If the account is not found, surface a nicer error message for logging.
              .catch(StellarSdk.NotFoundError, function (error) {
                throw new Error('The destination account does not exist!');
              })
              // If there was no error, load up-to-date information on your account.
              .then(function() {
                return server.loadAccount(self.getAddress());
              })
              .then(function(sourceAccount) {
                // Start building the transaction.
                transaction = new StellarSdk.TransactionBuilder(sourceAccount)
                  .addOperation(StellarSdk.Operation.payment({
                    destination: to,
                    // Because Stellar allows transaction in many currencies, you must
                    // specify the asset type. The special "native" asset represents Lumens.
                    asset: StellarSdk.Asset.native(),
                    amount: amount
                  }))
                  .build();
                // Sign the transaction to prove you are actually the person sending it.
                transaction.sign(self.account)// use the keypair to sign
                // And finally, send it off to Stellar!
                return server.submitTransaction(transaction);
              })
              .then(function(result) {
                console.log('Success! Results:', result);
              })
              .catch(function(error) {
                console.error('Something went wrong!', error);
                // If the result is unknown (no response body, timeout etc.) we simply resubmit
                // already built transaction:
                // server.submitTransaction(transaction);
              });
        } else if (this.network == 'ethereum') {
                // infura accepts only raw transactions, because it does not handle private keys
            const rawTransaction = {
            "from": this.getAddress(),//'0x1d14a9ed46653b2b833f4dac3b6a786c76faedc2', from address
            "to": to,//'0x2e2a32690B2D09089F62BF3C262edA1aC1118f8F', to address
            "value": web3.utils.toHex(web3.utils.toWei(amount, "ether")),// e.g. '0.001'
            "gas": 30000,
            "chainId": 4 // https://ethereum.stackexchange.com/questions/17051/how-to-select-a-network-id-or-is-there-a-list-of-network-ids
            
            };
            
            this.account.signTransaction(rawTransaction)
            .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
            .then(receipt => console.log("Transaction receipt: ", receipt))
            .catch(err => console.error(err));
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
// let acc = wallet_manager.getAccount(3)
// console.log(acc.getAddress())
// acc.send(expectedPublicKey, '1000')

// let wallet_manager_module = require('./wallet_manager')
// let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
// const wallet_manager = new wallet_manager_module('ethereum')
// wallet_manager.setSeed(seed_phrases)
// wallet_manager.setWallet()
// let fromPrivateKey = '0x10848a86334b428a2f6bdaeaf6dccbe6b3d07ebcc538af29f83a9139ac6c40e8'
// let fromPublicKey = '0xfd3B37102b3882E08c8D38fF8BAc1b1b305dc103'
// let toPrivateKey = '0x0442eaba5727f864d62dab0858bd07e6c24484711b215285b108ee6048ba87ea'
// let toPublicKey = '0x7037eAcB1bb6Bf8eE8Cdd1A48f59D3b5BeC63BC2'
// let acc = wallet_manager.getAccount(3)//3 from 4 to
// console.log(acc.getAddress())
// console.log(acc.getPrivateKey())
// acc.send(toPublicKey, '0.01')
