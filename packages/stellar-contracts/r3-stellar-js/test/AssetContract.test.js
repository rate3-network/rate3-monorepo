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
        this.r3 = await R3Stellar('TESTNET', HORIZON_TESTNET_URL);
        this.r3.Stellar.Config.setDefault();

        // Create Keypairs for issuer and distributor.
        this.issuerKeypair = this.r3.Stellar.Keypair.random();
        this.distributorKeypair = this.r3.Stellar.Keypair.random();

        // Create Keypair for user.
        this.userKeypair = this.r3.Stellar.Keypair.random();

        // Get the free test XLM for us to use the accounts.
        await axios.get(`${HORIZON_TESTNET_URL}/friendbot?addr=${this.issuerKeypair.publicKey()}`);
        await axios.get(`${HORIZON_TESTNET_URL}/friendbot?addr=${this.distributorKeypair.publicKey()}`);
        await axios.get(`${HORIZON_TESTNET_URL}/friendbot?addr=${this.userKeypair.publicKey()}`);
    });

    describe('Asset creation flow', function () {
        before(async function () {
            // Create asset.
            this.asset = new this.r3.Stellar.Asset('TestAsset', this.issuerKeypair.publicKey());
        });

        it("able to create trustline between issuer and distributor", async function () {
            // Create a trustline with issuing account with distributor account.
            const { tx } = await this.r3.assetContracts.trustIssuingAccount({
                asset: this.asset,
                accountPublicKey: this.distributorKeypair.publicKey(),
            });

            // Sign transaction with distributor.
            tx.sign(this.distributorKeypair);

            const res = await this.r3.stellar.submitTransaction(tx);
        });

        it("able to issue asset to distributor", async function () {
             // Mint asset to distributor.
            const { tx } = await this.r3.assetContracts.mintAsset({
                asset: this.asset,
                amount: 1000,
                issuingAccountPublicKey: this.issuerKeypair.publicKey(),
                distributionAccountPublicKey: this.distributorKeypair.publicKey(),
            });

            // Sign transaction with issuer.
            tx.sign(this.issuerKeypair);

            const res = await this.r3.stellar.submitTransaction(tx);
        });

       it("able to create trustline between issuer and user", async function () {
            // Create a trustline with issuing account with user account.
            const { tx } = await this.r3.assetContracts.trustIssuingAccount({
                asset: this.asset,
                accountPublicKey: this.userKeypair.publicKey(),
            });

            // Sign transaction with user.
            tx.sign(this.userKeypair);

            const res = await this.r3.stellar.submitTransaction(tx);
        });

        it("able to distribute asset to user", async function () {
            // Distribute asset to user.
            const { tx } = await this.r3.assetContracts.distributeAsset({
                asset: this.asset,
                amount: 1000,
                distributionAccountPublicKey: this.distributorKeypair.publicKey(),
                destinationAccountPublicKey: this.userKeypair.publicKey(),
            });

            // Sign transaction with distributor.
            tx.sign(this.distributorKeypair);

            const res = await this.r3.stellar.submitTransaction(tx);
        });

        it("able to burn asset from user", async function () {
            // Burn asset from user.
           const { tx } = await this.r3.assetContracts.burnAsset({
               asset: this.asset,
               amount: 500,
               issuingAccountPublicKey: this.issuerKeypair.publicKey(),
               burnerAccountPublicKey: this.userKeypair.publicKey(),
           });

           // Sign transaction with user.
           tx.sign(this.userKeypair);

           const res = await this.r3.stellar.submitTransaction(tx);

           //console.log(tx.toEnvelope().toXDR().toString("base64"));
        });

        it("able to convert asset to ethereum token from user", async function () {
            // Convert asset to ethereum from user.
           const { tx } = await this.r3.assetContracts.convertAssetToEthereumToken({
               asset: this.asset,
               amount: 500,
               issuingAccountPublicKey: this.issuerKeypair.publicKey(),
               converterAccountPublicKey: this.userKeypair.publicKey(),
               ethereumAccountAddress: '840e842023E9e312348A3b3c90DFe6216E352984',
           });

           // Sign transaction with user.
           tx.sign(this.userKeypair);

           const res = await this.r3.stellar.submitTransaction(tx);
        });

        it("able to convert ethereum token to asset for user", async function () {
            // Mint asset to distributor.
            const { tx: preTx } = await this.r3.assetContracts.mintAsset({
                asset: this.asset,
                amount: 1000,
                issuingAccountPublicKey: this.issuerKeypair.publicKey(),
                distributionAccountPublicKey: this.distributorKeypair.publicKey(),
            });

            // Sign transaction with issuer.
            preTx.sign(this.issuerKeypair);

            const preRes = await this.r3.stellar.submitTransaction(preTx);

            // Convert asset to ethereum from user.
            const { tx } = await this.r3.assetContracts.convertEthereumTokenToAsset({
               asset: this.asset,
               amount: 1000,
               distributionAccountPublicKey: this.distributorKeypair.publicKey(),
               converterAccountPublicKey: this.userKeypair.publicKey(),
               ethereumAccountAddress: '840e842023E9e312348A3b3c90DFe6216E352984',
           });

           // Sign transaction with user.
           tx.sign(this.distributorKeypair);

           const res = await this.r3.stellar.submitTransaction(tx);
        });

        it("able to set asset authorization", async function () {
            // Mint asset to distributor.
           const { tx } = await this.r3.assetContracts.setAssetAuthorization({
               asset: this.asset,
               issuingAccountPublicKey: this.issuerKeypair.publicKey(),
               authorization: 'revocable',
           });
           // NOTE: This breaks existing transactions, since this requires an
           // additional 'Allow Trust' operation TODO(waihon)

           // Sign transaction with issuer.
           tx.sign(this.issuerKeypair);

           const res = await this.r3.stellar.submitTransaction(tx);
       });
    });
});