import 'babel-polyfill';

import R3Stellar from '../r3-stellar.js';
import axios from 'axios';

require('chai')
.use(require('chai-as-promised'))
.should();

describe("AssetContracts integration tests", function () {
    // Actual Stellar horizon testnet address.
    const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org';

    // Let's rate limit ourselves before Stellar bans us.
    const TIMEOUT = 30*1000;
    this.timeout(TIMEOUT);
    this.slow(TIMEOUT/2);

    before(async function () {
        this.r3 = await R3Stellar(HORIZON_TESTNET_URL);
        this.r3.Stellar.Config.setDefault();

        // Create Keypairs for issuer and distributor
        this.issuerKeypair = this.r3.Stellar.Keypair.random();
        this.distributorKeypair = this.r3.Stellar.Keypair.random();

        // Get the free test XLM for us to use the accounts.
        await axios.get(`${HORIZON_TESTNET_URL}/friendbot?addr=${this.issuerKeypair.publicKey()}`);
        await axios.get(`${HORIZON_TESTNET_URL}/friendbot?addr=${this.distributorKeypair.publicKey()}`);
    });

    describe('Asset creation flow', function () {
        before(async function () {
            // Create asset
            this.asset = new this.r3.Stellar.Asset('TestAsset', this.issuerKeypair.publicKey());
        });

        it("able to create trustline between issuer and distributor", async function () {
            // Create a trustline with issuing account with distributor account
            const { tx } = await this.r3.assetContracts.trustIssuingAccount({
                asset: this.asset,
                distributionAccountPublicKey: this.distributorKeypair.publicKey(),
            });

            // Sign transaction with distributor
            tx.sign(this.distributorKeypair);

            const res = await this.r3.stellar.submitTransaction(tx);

            console.log(res);
        });

        it("able to issue asset to distributor", async function () {
             // Mint asset to distributor
            const { tx } = await this.r3.assetContracts.mintAsset({
                asset: this.asset,
                amount: 1000,
                issuingAccountPublicKey: this.issuerKeypair.publicKey(),
                distributionAccountPublicKey: this.distributorKeypair.publicKey(),
            });

            // Sign transaction with issuer
            tx.sign(this.issuerKeypair);

            const res = await this.r3.stellar.submitTransaction(tx);

            console.log(res);
        });

        it("able to set asset authorization", async function () {
            // Mint asset to distributor
           const { tx } = await this.r3.assetContracts.setAssetAuthorization({
               asset: this.asset,
               issuingAccountPublicKey: this.issuerKeypair.publicKey(),
               authorization: 'revocable',
           });

           // Sign transaction with issuer
           tx.sign(this.issuerKeypair);

           const res = await this.r3.stellar.submitTransaction(tx);

           console.log(res);
       });
    });

});