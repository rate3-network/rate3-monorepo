/**
* The code is refered from the following links
* https://www.npmjs.com/package/stellar-hd-wallet for account creation
* https://www.npmjs.com/package/node-forge for encryption, decryption
* https://www.stellar.org/developers/guides/ for uploading accounts to testnet, transaction
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

/** This is a wrapper class over stellar and ethereum wallets */
class wallet_manager{
    constructor(network) {
        if (network == 'stellar') {
            this.network = 'stellar'
            this.accountArray = []
        } else if (network == 'ethereum') {
            this.network = 'ethereum'
            this.accountArray = []
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
            this.accountArray = [] // discard the accounts in another network
            this.account = []
        } else if (network == 'ethereum') {
            this.network = 'ethereum'
            this.accountArray = []
            this.account = []
        } else {
            console.log('The name of the network must be stellar or ethereum.')
        }
    }

    /**
     * Return the name of the current network
     */
    getNetwork() {
        if (this.network == null) {
            console.log('the network of the wallet manager is not set.')
            return null
        } else {
            return this.network
        }
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
        if (this.seed == null) {
            console.log('The seed of the wallet is not set.')
            return null
        } else {
            return this.seed
        }
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
        if(this.wallet == null) {
            console.log('The wallet is not set.')
            return null
        } else {
            return this.wallet
        }
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
    async getAccount () {
        if (arguments.length == 0){
            if(this.wallet == null) {
                console.log('The wallet is not initialized.')
                return null
            } else {
                switch(this.network) {
                    case 'stellar':
                        this.account = new account(this.network)
                        await this.account.setAccount(this.wallet.getKeypair(0))
                        this.accountArray.push(Object.assign({}, this.account))
                        return this.account
                    case 'ethereum':
                        let privateKey = '0x' + this.wallet.deriveChild(0).getWallet()._privKey.toString('hex')
                        this.account = new account(this.network)
                        await this.account.setAccount(web3.eth.accounts.privateKeyToAccount(privateKey))
                        this.accountArray.push(Object.assign({}, this.account))
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
                    await this.account.setAccount(this.wallet.getKeypair(arguments[0]))
                    this.accountArray.push(Object.assign({}, this.account))
                    break
                case 'ethereum':
                    let privateKey = '0x' + this.wallet.deriveChild(arguments[0]).getWallet()._privKey.toString('hex')
                    this.account = new account(this.network)
                    await this.account.setAccount(web3.eth.accounts.privateKeyToAccount(privateKey))
                    this.accountArray.push(Object.assign({}, this.account))
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
                            await this.account.setAccount(StellarSdk.Keypair.fromSecret(arguments[0]))
                            this.accountArray.push(Object.assign({}, this.account))
                        } else {
                            this.account = null
                            console.log('The starting char must be S (private key)')
                        }
                    case 'ethereum':
                        this.account = new account(this.network)
                        await this.account.setAccount(web3.eth.accounts.privateKeyToAccount(arguments[0]))
                        this.accountArray.push(Object.assign({}, this.account))
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

    /**
     * A shorthand for creating multiple accounts.
     * The accounts created will be the 0th, 1st, ... (n-1)th in the wallet
     * @param {int} numberOfAccounts 
     */
    setMultipleAccounts(numberOfAccounts) {
        for (var i = 0; i < numberOfAccounts; i++) {
            this.getAccount(i)
        }
    }

    /**
     * Return the account array.
     * The index of accounts in this array can be different from the index of the account in the wallet,
     * depending on the sequence the accounts are created.
     */
    getAccountArray() {
        if(this.accountArray == null) {
            console.log('The account array is empty')
            return null
        } else {
            return this.accountArray
        }
    }

    /**
     * @param {object} account - The account to be encrypted. Only the private key will be encrypted.
     * @param {string} password - The password string used to encrypt the private key
     * If on stellar, return the encrypted private key;
     * If on ethereum, return the keystore V3 JSON.
     * Plus all the auxiliary fields
     */
    encrypt(account, password) {
        switch(account.network) {
            case 'stellar':
                // AES key and IV sizes
                const keySize = 24;
                const ivSize = 8;
            
                // get derived bytes
                const salt = forge.random.getBytesSync(8);
                const derivedBytes = forge.pbe.opensslDeriveBytes(
                password, salt, keySize + ivSize/*, md*/);
                const buffer = forge.util.createBuffer(derivedBytes);
                const key = buffer.getBytes(keySize);
                const iv = buffer.getBytes(ivSize);
            
                let cipher = forge.cipher.createCipher('AES-CBC', key);
                cipher.start({iv: iv});
                cipher.update(forge.util.createBuffer(account.getPrivateKey(), 'binary'));
                cipher.finish();
            
                let output = forge.util.createBuffer();
            
                // if using a salt, prepend this to the output:
                if(salt !== null) {
                output.putBytes('Salted__'); // (add to match openssl tool output)
                output.putBytes(salt);
                }
                output.putBuffer(cipher.output);
                return {original: output, network: this.network, balance: account.balance}
            case 'ethereum':
                return {original: web3.eth.accounts.encrypt(account.getPrivateKey(), password), network: this.network, balance: account.balance}    
            //return this.getOriginalAccount().encrypt(this.getPrivateKey(), password)
            default:
                console.log('The network is not correctly set')
                return null
        }
    }

    /**
     * 
     * @param {object} cipher - The encrypted object 
     * @param {string} password - The password that is used to encrypt the account
     * Return an account, reconstructed from the cipher
     * The fields remain the same, but methods are not.
     * However, these methods will not be used, i.e. will use web3/stellar libraries.
     */
    decrypt(cipher, password) {
        switch(this.network) {
            case 'stellar':    
                // parse salt from input
                let input = forge.util.createBuffer(cipher.original, 'binary');
                // skip "Salted__" (if known to be present)
                input.getBytes('Salted__'.length);
                // read 8-byte salt
                const salt = input.getBytes(8);
            
                // AES key and IV sizes
                const keySize = 24;
                const ivSize = 8;
            
                const derivedBytes = forge.pbe.opensslDeriveBytes(
                password, salt, keySize + ivSize);
                const buffer = forge.util.createBuffer(derivedBytes);
                const key = buffer.getBytes(keySize);
                const iv = buffer.getBytes(ivSize);
            
                let decipher = forge.cipher.createDecipher('AES-CBC', key);
                decipher.start({iv: iv});
                decipher.update(input);
                const result = decipher.finish(); // check 'result' for true/false
            
                let decryptedPrivateKey = decipher.output.data;
                let decryptedStellarAccount = new account(cipher.network)
                decryptedStellarAccount.setAccount(StellarSdk.Keypair.fromSecret(decryptedPrivateKey))
                return decryptedStellarAccount
            case 'ethereum':
                let decryptedAccount = new account(cipher.network)
                decryptedAccount.setAccount(web3.eth.accounts.decrypt(cipher.original, password))
                return decryptedAccount
            default:
                console.log('The network is not correctly set')
                return null
        }
    }
    
}

module.exports = wallet_manager
