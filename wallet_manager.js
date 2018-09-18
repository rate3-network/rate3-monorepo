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

let account = require('./account')

/**
 * This is a wrapper class over stellar and ethereum wallets
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

    /**
     * Change to a new network. If the input is invalid, it will not change. 
     * @param {string} network - The name of the network, 'stellar' or 'ethereum'
     */
    changeNetwork(network) {
        if (network == 'stellar') {
            this.network = 'stellar'
        } else if (network == 'ethereum') {
            this.network = 'ethereum'
        } else {
            console.log('The name of the network must be stellar or ethereum.')
        }
    }

    /**
     * Return the name of the current network
     */
    getNetwork() {
        return this.network
    }

    /**
     * If the argument is empty, generate random seed phrases (12 words).
     * If the arugment is a number, generate that number of seed phrases.
     * If the argument is a string of seed phrases, use it.
     */
    setSeed() {
        if (arguments.length == 0){
            //generate seed; both network uses the same bip39 module to generate seed phrases
            switch(this.network) {
                case 'stellar':
                case 'ethereum':
                    this.seed = bip39.generateMnemonic()
                    //default strength = 128, 12 words
                    //160 - 18 words; 224 - 21 words; 256 - 24 words
                    break
                default:
                    this.seed = null
                    console.log('The network has not been set.')
            }
        } else if (arguments.length === 1) {
            if ([12,18,21,24].includes(arguments[0])) {
                let strength = (function(number_of_words) {
                    switch(number_of_words) {
                        case 12:
                            return 128
                        case 18: 
                            return 160
                        case 21:
                            return 224
                        case 24:
                            return 256
                        default:
                            return 128
                    }
                })(arguments[0]);
                this.seed = bip39.generateMnemonic(strength)
            } else if (typeof(arguments[0]) === 'string') {
                if (bip39.validateMnemonic(arguments[0])) {
                    this.seed = arguments[0];
                } else {
                    this.seed = null
                    console.log('The input is not a set of valid seed phrases.')
                }
            } else {
                this.seed = null
                console.log('The number of seed phrases must be one of 12, 18, 21, 24.')
            }

        } else {
            console.log('The argument must be empty, number of seed phrases, or valid seed phrases.')
        }
        return this.seed
    }

    /**
     * Return the current seed
     */
    getSeed() {
        return this.seed
    }

    /**
     * Generate the wallet based on the seed
     */
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
                this.wallet = null
                console.log('The seed is not specified or not valid.')
        } 
        return this.wallet
    }

    /**
     * Return the current wallet
     */
    getWallet() {
        return this.wallet
    }

    /**
     * Before generating accounts, the seed and wallet MUST be there.
     * i.e., random account generatation is NOT allowed. 
     * If the wallet is set, generate the first (0) account in the wallet;
     * If the parameter is a number,
     * Generate the account in the wallet. Its index is the number.
     * If the parameter is a string,
     * Use it as the private/public key to generate the account
     */
    getAccount () {
        if (arguments.length == 0){
            if(this.wallet == null) {
                console.log('The wallet is not initialized.')
                return null
            } else {
                switch(this.network) {
                    case 'stellar':
                        this.account = new account(this.network)
                        this.account.setAccount(this.wallet.getKeypair(0))
                        return this.account
                    case 'ethereum':
                        let privateKey = '0x' + this.wallet.deriveChild(0).getWallet()._privKey.toString('hex')
                        this.account = new account(this.network)
                        this.account.setAccount(web3.eth.accounts.privateKeyToAccount(privateKey))
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
                    this.account = new account(this.network)
                    this.account.setAccount(this.wallet.getKeypair(arguments[0]))
                    break
                case 'ethereum':
                    let privateKey = '0x' + this.wallet.deriveChild(arguments[0]).getWallet()._privKey.toString('hex')
                    this.account = new account(this.network)
                    this.account.setAccount(web3.eth.accounts.privateKeyToAccount(privateKey))
                    break
                default:
                    this.account = null
                    console.log('The network has not been set.')
            }
            return this.account
        } else if (arguments.length === 1 && typeof(arguments[0]) === 'string') {
            try {
                switch(this.network) {
                    case 'stellar':
                        if(arguments[0].charAt(0) == 'S') {
                            // generate account from private key
                            this.account = new account(this.network)
                            this.account.setAccount(StellarSdk.Keypair.fromSecret(arguments[0]))
                        } else {
                            this.account = null
                            console.log('The starting char must be S (private key)')
                        }
                    case 'ethereum':
                        this.account = new account(this.network)
                        this.account.setAccount(web3.eth.accounts.privateKeyToAccount(arguments[0]))
                    default:
                        this.account = null
                        console.log('The network has not been set.')
                }
                return null   
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
