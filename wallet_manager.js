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
const ethereum_wallet = require('ethereumjs-wallet')
var Web3 = require('web3');
var web3 = new Web3("https://rinkeby.infura.io/v3/54add33f289d4856968099c7dff630a7");

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
        this.accountSet = new Set()
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

    getNetwork() {
        return this.network
    }

    setSeed() {
        if (arguments.length == 0){
            //generate seed
            switch(this.network) {
                case 'stellar':
                    this.seed = stellarHDWallet.generateMnemonic()// bip39 is the underlying module 
                    break
                case 'ethereum':
                    this.seed = bip39.generateMnemonic()
                    break
                default:
                    console.log('The network has not been set.')
            }
        } else if (arguments.length === 1 && typeof(arguments[1]) === 'string') {
            if (bip39.validateMnemonic(arguments[1])) {
                this.seed = arguments[1];
            } else {
                console.log('The input is not a set of valid seed phrases.')
            }

        } else {
            console.log('The argument must be empty or valid seed phrases.')
        }

    }

    getSeed() {
        return this.seed
    }

    setWallet() {
        var hdkey = require('ethereumjs-wallet/hdkey')
        switch(this.network) {
            case 'stellar': 
                this.wallet = stellarHDWallet.fromMnemonic(this.seed)
                break
            case 'ethereum':
                this.wallet = hdkey.fromMasterSeed(this.seed)
                break;
            default:
                console.log('The seed is not specified or not valid.')
        } 
    }

    getWallet() {
        return this.wallet
    }

    /**
     * If called without a parameter,
     * If the wallet is also not set, generate a random accoun;
     * If the wallet is set, generate the first (0) account in the wallet;
     * If the parameter is a number,
     * Generate the account in the wallet. Its index is the number.
     * If the parameter is a string,
     * Use it as the private/public key to generate the account
     */
    getAccount () {
        if (arguments.length == 0){
            if(this.wallet == null) {
                //generate a standalone account
                switch(this.network) {
                    case 'stellar':
                        this.account = StellarSdk.Keypair.random()
                        return this.account
                    case 'ethereum':
                        this.account = web3.eth.accounts.create();
                        return this.account
                    default:
                        console.log('The network is not set.')
                }
            } else {
                switch(this.network) {
                    case 'stellar':
                        this.account = this.wallet.getKeypair(0)
                        return this.account
                    case 'ethereum':
                        this.account = this.wallet.deriveChild(0)
                        return this.account
                    default:
                        console.log('The network is not set.')
                        return null
                }
                //generate the 0th account in the wallet 
            }
        } else if (arguments.length === 1 && Number.isInteger(arguments[0]) && arguments[0] > 1) {
            //generate the account of the wallet at the specified index
            switch(this.network) {
                case 'stellar':
                    this.account = this.wallet.getKeypair(arguments[0])
                    return this.account
                    break
                case 'ethereum':
                    this.account = this.wallet.deriveChild(arguments[0])
                    return this.account
                    break
                default:
                    console.log('The network has not been set.')
            }

        } else if (arguments.length === 1 && typeof(arguments[0]) === 'string') {
            try {
                switch(this.network) {
                    case 'stellar':
                        if(arguments[0].charAt(0) == 'S') {
                            // generate account from private key
                            this.account = StellarSdk.Keypair.fromSecret(arguments[0])
                            return this.account
                        } else if (arguments[0].charAt(0) == 'G') {
                            this.account = StellarSdk.Keypair.fromPublicKey(arguments[0]);
                            return this.account
                        } else {
                            console.log('The starting char must be S (private key) or G (public key)')
                            return null
                        }
                        case 'ethereum':
                            this.account = web3.eth.accounts.privateKeyToAccount(arguments[0])
                            return this.account
                        default:
                            console.log('The network has not been set.')
                            return null
                    }   
                }
                catch (err) {
                    console.log('The input is not a valid private/public key.')
                    return null
                }  
        } else {
            console.log('The argument must be empty, or 0,1,2,...')
            return null
        }

    }

    //set
}

module.exports = wallet_manager

// let acc = new wallet_manager('ethereum')
// acc.setSeed()
// acc.getSeed()
// acc.setWallet()
// console.log(acc.getAccount())
