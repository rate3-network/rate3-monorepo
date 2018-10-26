import 'babel-polyfill';

import R3Stellar from '../r3-stellar.js';
import { makePreimageHashlockPair, makeTimestamp } from './helpers.js';
import axios from 'axios';

require('chai')
.use(require('chai-as-promised'))
.should();

describe("HashedTimelockContracts integration tests", function () {
    // Actual Stellar horizon testnet address.
    const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org';

    // Let's rate limit ourselves before Stellar bans us.
    const TIMEOUT = 60*1000;
    this.timeout(TIMEOUT);
    this.slow(TIMEOUT/2);

    before(async function () {
        this.r3 = await R3Stellar(HORIZON_TESTNET_URL);
        this.r3.Stellar.Config.setDefault();

        // Create Keypairs for issuer and distributor
        this.issuerKeypair = this.r3.Stellar.Keypair.random();
        this.distributorKeypair = this.r3.Stellar.Keypair.random();

        // Create Keypairs for Alice and Bob
        this.holdingKeypair = this.r3.Stellar.Keypair.random();
        this.aliceKeypair = this.r3.Stellar.Keypair.random();
        this.bobKeypair = this.r3.Stellar.Keypair.random();

        // Get the free test XLM for us to use the accounts.
        await axios.get(`${HORIZON_TESTNET_URL}/friendbot?addr=${this.issuerKeypair.publicKey()}`);
        await axios.get(`${HORIZON_TESTNET_URL}/friendbot?addr=${this.distributorKeypair.publicKey()}`);

        await axios.get(`${HORIZON_TESTNET_URL}/friendbot?addr=${this.aliceKeypair.publicKey()}`);
        await axios.get(`${HORIZON_TESTNET_URL}/friendbot?addr=${this.bobKeypair.publicKey()}`);

        // Setup hashlock
        this.preimageHashlockPair = makePreimageHashlockPair();
    });

    describe('HashedTimelockContract creation flow', function () {
        before(async function () {
            // Create asset
            this.asset = new this.r3.Stellar.Asset('TestAsset', this.issuerKeypair.publicKey());

            // Create a trustline with issuing account with distributor account
            let { tx: tx1 } = await this.r3.assetContracts.trustIssuingAccount({
                asset: this.asset,
                distributionAccountPublicKey: this.distributorKeypair.publicKey(),
            });

            // Sign transaction with distributor
            tx1.sign(this.distributorKeypair);

            const res1 = await this.r3.stellar.submitTransaction(tx1);

            //console.log(res1);

            // Mint asset to distributor
            let { tx: tx2 } = await this.r3.assetContracts.mintAsset({
            asset: this.asset,
                amount: 10000,
                issuingAccountPublicKey: this.issuerKeypair.publicKey(),
                distributionAccountPublicKey: this.distributorKeypair.publicKey(),
            });

            // Sign transaction with issuer
            tx2.sign(this.issuerKeypair);

            const res2 = await this.r3.stellar.submitTransaction(tx2);

            //console.log(res2);

            // Create a trustline with issuing account with alice account
            let { tx: tx3 } = await this.r3.assetContracts.trustIssuingAccount({
                asset: this.asset,
                distributionAccountPublicKey: this.aliceKeypair.publicKey(),
            });

            // Sign transaction with alice
            tx3.sign(this.aliceKeypair);

            const res3 = await this.r3.stellar.submitTransaction(tx3);

            // Create a trustline with issuing account with bob account
            let { tx: tx4 } = await this.r3.assetContracts.trustIssuingAccount({
                asset: this.asset,
                distributionAccountPublicKey: this.bobKeypair.publicKey(),
            });

            // Sign transaction with distributor
            tx4.sign(this.bobKeypair);

            const res4 = await this.r3.stellar.submitTransaction(tx4);

            // Distribute assets to Alice
            const { tx: tx5 } = await this.r3.assetContracts.distributeAsset({
                asset: this.asset,
                amount: 2000,
                distributionAccountPublicKey: this.distributorKeypair.publicKey(),
                destinationAccountPublicKey: this.aliceKeypair.publicKey(),
            });

            // Sign transaction with distributor
            tx5.sign(this.distributorKeypair);

            const res5 = await this.r3.stellar.submitTransaction(tx5);

            //console.log(res5);
        });

        it("able to create holding account", async function () {
            // Alice creates a holding account.
            const { tx } = await this.r3.hashedTimelockContracts.createHoldingAccount({
                asset: this.asset,
                swapAmount: 1000,
                baseReserve: 0.5,
                depositorAccountPublicKey: this.aliceKeypair.publicKey(),
                holdingAccountPublicKey: this.holdingKeypair.publicKey(),
            });

            // Sign transaction with alice and holding account.
            tx.sign(this.aliceKeypair, this.holdingKeypair);

            console.log('holding account XDR');
            console.log(tx.toEnvelope().toXDR().toString("base64"));

            const res = await this.r3.stellar.submitTransaction(tx);
        });

        it("able to finalize holding account", async function () {
            // Alice finalizes the holding account
            // refundTime is zero, can be refunded immediately (for testing)
            const { holdingTx, claimTx, refundTx } = await this.r3.hashedTimelockContracts.finalizeHoldingAccount({
                asset: this.asset,
                hashlock: this.preimageHashlockPair.hashlock,
                swapAmount: 1000,
                refundTime: makeTimestamp(0),
                depositorAccountPublicKey: this.aliceKeypair.publicKey(),
                claimerAccountPublicKey: this.bobKeypair.publicKey(),
                holdingAccountPublicKey: this.holdingKeypair.publicKey(),
            });

            // Sign transaction with alice and holding account.
            // holdingTx.sign(this.aliceKeypair, this.holdingKeypair);

            console.log('holding finalize XDR');
            console.log(holdingTx.toEnvelope().toXDR().toString("base64"));

            console.log('claim XDR');
            console.log(claimTx.toEnvelope().toXDR().toString("base64"));

            console.log('refund XDR');
            console.log(refundTx.toEnvelope().toXDR().toString("base64"));

            console.log('KEYS');
            console.log(this.holdingKeypair.secret(), this.aliceKeypair.secret(), this.bobKeypair.secret());

            //const res = await this.r3.stellar.submitTransaction(holdingTx);
        });
    });
});