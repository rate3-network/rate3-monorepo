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
var rp = require('request-promise');
var request = require('request');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

/**
 * @class account
 * @description
 * This is a wrapper class over stellar and ethereum accounts.
 * For those fields/methods that are already there when the original
 * account is passed in, this class simply extracts them;
 * Otherwise, the fields/methods are created and saved in this class. 
 */
class account{
    /**
     * constructor
     * @memberof account
     * @param {string} network 
     */
    constructor(network) {
        if (network == 'stellar') {
            this.network = 'stellar'
            this.testAddress = 'https://horizon-testnet.stellar.org' + '/accounts/'
            StellarSdk.Network.useTestNetwork();
        } else if (network == 'ethereum') {
            this.network = 'ethereum'
        } else {
            console.log('The name of the network must be stellar or ethereum.')
        }
    }

    /**
     * Returns xdr.ChangeTrustOp
     * @param {string} assetName 
     * @param {string} limit 
     * @param {string} source 
     */
    changeTrust(assetName,issuerPublickey, limit) {
        var self = this
        if(this.network == null) {
            console.log('The network is not set.')
            return null
        } else if (this.network == 'stellar') {
            var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
            // Create an object to represent the new asset
            var newAsset = new StellarSdk.Asset(assetName, issuerPublickey);

            // First, the receiving account must trust the asset
            server.loadAccount(this.getAddress())
            .then(function(receiver) {
                var transaction = new StellarSdk.TransactionBuilder(receiver)
                // The `changeTrust` operation creates (or alters) a trustline
                // The `limit` parameter below is optional
                .addOperation(StellarSdk.Operation.changeTrust({
                    asset: newAsset,
                    limit: limit
                }))
                .build();
                transaction.sign(self.account);
                //console.log(self.getAddress())
                //let result = server.submitTransaction(transaction).then(console.log)
                //return result;
                return server.submitTransaction(transaction)
            })
        } else if (this.network == 'ethereum') {
            return null
        }
    }

    /**
     * set the balance field of this account
     * @param {string} publicKey - the publick key of the account
     */
    async loadBalance(publicKey) {
        try {
            let response = await rp(this.testAddress + publicKey)
            this.balance = JSON.parse(response).balances[0].balance
        } catch(err) {
            console.log('Error in loading balance')
        }
    }

    /**
     * Set the account field of this account to be the argument;
     * For Stellar, upload it to the testnet and update the balance;
     * For Ethereum, update its balance read on the Rinbeky testnet.
     * @param {object} account - A stellar or ethereum account
     */
    async setAccount (account) {
        var request = require('request');
        if (this.network == null) {
            console.log('The network of this account must be set first.')
            return null
        } else if (this.network == 'stellar') {
            //check if the account is already on testnet
            this.account = account
            this.balance = '-1'
            var self = this
            await this.loadBalance(this.getAddress())
            if (this.balance == null) {
              await rp({
                url: 'https://friendbot.stellar.org',
                qs: { addr: self.getAddress() },
                json: true
                }).then(async function(htmlString) {
                  self.balance = await loadBalance(self.getAddress())
                })
                .catch(function (err) {
                  console.log(err)
                });
            } else {
              console.log('the account is already on the testnet')
            }
        } else if (this.network == 'ethereum') {
            this.account = account
            this.balance = '-1'
            var self = this
            await web3.eth.getBalance(account.address)
            .then(function(response) {
                if (typeof response == 'string') {
                    self.balance = response
                } else {
                    console.log('Cannot get the eth balance')
                }
            });
        } else {
            this.account = null
            console.log('The account network is not correctly set.')
        }
    }

    /**
     * Sign the data using the private key of the current account
     * @param {string} data - the data (string) to be signed
     */
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
     * 
     * @param {} tx 
     */
    signTransaction(tx) {

    }

    webAuthenticate(tx) {

    }

    /**
     * Send an amount from the current account to another account
     * @param {string} to - the address that recerives XLM/ETH
     * @param {string} amount - the amount of XLM/ETH sent; e.g. 100XLM; 0.01 eth
     */
    async send(to, amount) {
        var self = this
        if(this.network == 'stellar') {
            try {
                var transaction;
                await server.loadAccount(to)
                let accontOnTestnet = await server.loadAccount(self.getAddress());
                transaction = new StellarSdk.TransactionBuilder(accontOnTestnet)
                .addOperation(StellarSdk.Operation.payment({
                  destination: to,
                  asset: StellarSdk.Asset.native(),
                  amount: amount
                })).build();
                transaction.sign(self.account)
                let result = await server.submitTransaction(transaction);
                return result
            } catch (error) {
              console.error('Something went wrong!', error);
              return null
            }
        } else if (this.network == 'ethereum') {
            // infura accepts only raw transactions, because it does not handle private keys
            const rawTransaction = {
            "from": this.getAddress(),
            "to": to,
            "value": web3.utils.toHex(web3.utils.toWei(amount, "ether")),// e.g. '0.001'
            "gas": 30000,
            "chainId": 4 // https://ethereum.stackexchange.com/questions/17051/how-to-select-a-network-id-or-is-there-a-list-of-network-ids            
            };
            try {
                let signedTx = await this.account.signTransaction(rawTransaction)
                let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                return receipt
            } catch (err) {
                console.log('ethereum send transaction error', err)
                return null
            }           
        }
    }

    /**
     * This methods sets the history field of this account.
     * All the fields in the response are retained, in JSON format
     */
    async receive() {
        if(this.network == 'stellar') {
            let url = 'https://horizon-testnet.stellar.org/accounts/' + this.getAddress() + '/payments'
            try {
                let response = await rp(url)
                this.history =  JSON.parse(response)._embedded.records
                return this.history
            } catch (err) {
                console.log('error in fetching history', err)
            }

        } else if (this.network == 'ethereum') {
            let url = 'http://api-rinkeby.etherscan.io/api?module=account&action=txlist&address='+ this.getAddress() +'&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken'
            try {
                let response = await rp(url)
                this.history =  JSON.parse(response).result
                return this.history
            } catch (err) {
                console.log('error in fetching history', err)
            }
        }
        
    }

    /**
     * Construct the transaction from the uri (stellar), and sign it with the current account
     * Return the signed transaction
     * For ethereum, take the transaction hash, and sign it; 
     * Use the getter to get the signed transaction 
     * @param {string} uri - the input uri (stellar); tx hash (ethereum)
     */
    delegatedSigning(uri) {
        var self = this
        if(this.network == 'stellar') {
            let txEnvelope = StellarSdk.xdr.TransactionEnvelope.fromXDR(uri.slice(19), 'base64')
            //web+stellar:tx?xdr=... the xdr starts from position 19 of the string
            let tx1 = new StellarSdk.Transaction(txEnvelope);
            tx1.sign(this.account)
            return tx1
        } else if (this.network == 'ethereum') {
            //web3.eth.getTransaction('0x793aa73737a2545cd925f5c0e64529e0f422192e6bbdd53b964989943e6dedda')
            web3.eth.getTransaction(uri)// uri here is the transaction hash
            .then(function (tx) {
                return web3.eth.accounts.signTransaction(tx, self.getPrivateKey())
            }).then(function (signedTx) {self.signedTransaction = signedTx;
                console.log(self.signedTransaction)
                return self.signTransaction});
        }
    }

    /**
     * For ethereum delegated signing to get the signed transaction
     */
    getSignedTransaction() {
        return this.signedTransaction
    }

    /**
     * Return the network where the account is.
     */
    getNetwork() {
        return this.network
    }

    /**
     * Get the balance associated to this account.
     * Currently only values for XLM and ETH are saved.
     * i.e. there is no other types of currency.
     */
    getBalance() {
        return this.balance
    }

    /**
     * Get transaction history in and out from this account.
     * Currently it is the raw json response, and 
     * different between eth and stellar.
     */
    getHistory() {
        return this.history
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

    /**
     * Return the private key (ethereum) / secret (stellar)
     */
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
// web3.eth.getBalance("0x407d73d8a49eeb85d32cf465507dd71d507100c11")
// .then(function (response) {
//     console.log(typeof response)
// });
// let wallet_manager_module = require('./wallet_manager')
// let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
// const wallet_manager = new wallet_manager_module('stellar')
// wallet_manager.setSeed(seed_phrases)
// wallet_manager.setWallet()
// let toPrivateKey = 'SA6XR67FP7ZF4QBOYGPXUBSBQ6275E4HI7AOVSL56JETRBQG2COJCAGP' // 4
// let toPublicKey = 'GAQNFJEZWLX4MX6YFKQEPAXUH6SJRTTD4EAWGYOA34WNHNPW5EJXU4VV' // 4
// let fromAddress = 'GCQRO37IHQ2GOQPF7HOFSNK5TNKVQU77WUI2MX3JZ57CCQYSLJMV3NY2' // 3
// let fromPrivateKey = 'SCVOAKTGRAR2FOYRPXSSODGW5VDRT3HKTVAYAPU6M7H6XAGNKTWK3VJC' // 3
// let acc = await wallet_manager.getAccount(3)
// console.log(acc)
//acc.send(toPublicKey, 100)
// //let sampleXDR = 'web+stellar:tx?xdr=AAAAAKEXb+g8NGdB5fncWTVdm1VYU/+1EaZfac9+IUMSWlldAAAAZACpzYcAAAAKAAAAAAAAAAAAAAABAAAAAQAAAAChF2/oPDRnQeX53Fk1XZtVWFP/tRGmX2nPfiFDElpZXQAAAAEAAAAAINKkmbLvxl/YKqBHgvQ/pJjOY+EBY2HA3yzTtfbpE3oAAAAAAAAAAACYloAAAAAAAAAAAA=='
// //console.log(acc.delegatedSigning(sampleXDR))
// acc.changeTrust('FOO','GCYEJSMEEP7VQFFS6WELX3QSJRL3OQFIZ4MGXQL6R56P33TKBFBT2GNZ', '100000')

// acc.receive()
// acc.send(toPublicKey, '10')
// acc.send(toPublicKey, '20')
// acc.send(toPublicKey, '30')

// let wallet_manager_module = require('./wallet_manager')
// let seed_phrases = 'aspect body artist annual sketch know plug subway series noodle loyal word'
// const wallet_manager = new wallet_manager_module('ethereum')
// wallet_manager.setSeed(seed_phrases)
// wallet_manager.setWallet()
// let fromPrivateKey = '0x10848a86334b428a2f6bdaeaf6dccbe6b3d07ebcc538af29f83a9139ac6c40e8'
// let fromPublicKey = '0xfd3B37102b3882E08c8D38fF8BAc1b1b305dc103'
// let toPrivateKey = '0x0442eaba5727f864d62dab0858bd07e6c24484711b215285b108ee6048ba87ea'
// let toPublicKey = '0x7037eAcB1bb6Bf8eE8Cdd1A48f59D3b5BeC63BC2'
// let acc = wallet_manager.getAccount(4)//3 from 4 to
// console.log(acc.delegatedSigning('1'))
// console.log(acc.signedTransaction)
// console.log(acc.getAddress())
// // console.log(acc.getPrivateKey())
// //acc.send(toPublicKey, '0.01')
// acc.receive()

