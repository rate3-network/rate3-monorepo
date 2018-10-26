'use strict';

function HashedTimelockContracts(stellar, Stellar) {

    const makeHoldingKeys = async () => {
        const holdingKeys = Stellar.Keypair.random();
        return { holdingKeys };
    }

    const createHoldingAccount = async ({
        asset,
        swapAmount,
        baseReserve,
        depositorAccountPublicKey,
        holdingAccountPublicKey,
    }) => {
        let depositor = await stellar.loadAccount(depositorAccountPublicKey);

        // Create the holding account.
        const tx = new Stellar.TransactionBuilder(depositor)
            // 7 = 2 + 1 hashlock signer + 1 claimer signer + 1 asset trustline
            //       + refundTx pre-auth + claimTx pre-auth + 0.1 spare change
            .addOperation(Stellar.Operation.createAccount({
                destination: holdingAccountPublicKey,
                startingBalance: String(7.1 * baseReserve),
            }))

            // Set trustline for asset for holding account.
            .addOperation(Stellar.Operation.changeTrust({
                asset: asset,
                limit: String(swapAmount),
                source: holdingAccountPublicKey,
            }))

            // Deposit asset into holding account.
            .addOperation(Stellar.Operation.payment({
                asset: asset,
                amount: String(swapAmount),
                destination: holdingAccountPublicKey,
                source: depositorAccountPublicKey,
            }))

            .build();
            
        return { tx };
    }

    const finalizeHoldingAccount = async ({
        asset,
        hashlock,
        swapAmount,
        refundTime,
        depositorAccountPublicKey,
        claimerAccountPublicKey,
        holdingAccountPublicKey,
    }) => {
        let holding = await stellar.loadAccount(holdingAccountPublicKey);

        const initialSequenceNumber = holding.sequenceNumber();

        // Increment sequence number, this should be +1
        holding.incrementSequenceNumber();

        const nextStepSequenceNumber = holding.sequenceNumber();

        // Prepare the claim transaction.
        const claimTx = new Stellar.TransactionBuilder(holding)

        // Pay the claimer assets promised.
        .addOperation(Stellar.Operation.payment({
            asset: asset,
            amount: String(swapAmount),
            destination: claimerAccountPublicKey,
            source: holdingAccountPublicKey,
        }))

        // Destroy trustline for asset for holding account.
        .addOperation(Stellar.Operation.changeTrust({
            asset: asset,
            limit: String(0),
            source: holdingAccountPublicKey,
        }))

        // Merge accounts of original depositor and holding account.
        .addOperation(Stellar.Operation.accountMerge({
            destination: depositorAccountPublicKey,
            source: holdingAccountPublicKey,
        }))

        .build();

        // Reset sequence number.
        holding = await stellar.loadAccount(holdingAccountPublicKey);

        // Increment sequence number, this should be +1
        holding.incrementSequenceNumber();

        if (holding.sequenceNumber() !== nextStepSequenceNumber) {
            throw("Next step sequence number should match");
        }

        // Prepare the refund transaction.
        const refundTx = new Stellar.TransactionBuilder(holding, {
            timebounds: {
                minTime: refundTime,
                maxTime: 0,
            },
        })

        // Refund the depositor assets.
        .addOperation(Stellar.Operation.payment({
            asset: asset,
            amount: String(swapAmount),
            destination: depositorAccountPublicKey,
            source: holdingAccountPublicKey,
        }))

        // Destroy trustline for asset for holding account.
        .addOperation(Stellar.Operation.changeTrust({
            asset: asset,
            limit: String(0),
            source: holdingAccountPublicKey,
        }))

        // Merge accounts of original depositor and holding account.
        .addOperation(Stellar.Operation.accountMerge({
            destination: depositorAccountPublicKey,
            source: holdingAccountPublicKey,
        }))
        .build();

        // Reset sequence number again.
        holding = await stellar.loadAccount(holdingAccountPublicKey);

        if (holding.sequenceNumber() !== initialSequenceNumber) {
            throw("Initial sequence number should match");
        }

        // Finalize the holding account.
        //Account balance should have min balance covered beforehand.
        const holdingTx = new Stellar.TransactionBuilder(holding)
            // Add claimer as signer.
            .addOperation(Stellar.Operation.setOptions({
                signer: {
                    ed25519PublicKey: claimerAccountPublicKey,
                    weight: 1,
                },
                source: holdingAccountPublicKey,
            }))

            // Set hashlock signer.
            .addOperation(Stellar.Operation.setOptions({
                signer: {
                    sha256Hash: hashlock,
                    weight: 1,
                },
                source: holdingAccountPublicKey,
            }))

            // Preauthorize claim transaction.
            .addOperation(Stellar.Operation.setOptions({
                signer: {
                    preAuthTx: claimTx.hash(),
                    weight: 2,
                },
                source: holdingAccountPublicKey,
            }))

            // Preauthorize refund transaction.
            .addOperation(Stellar.Operation.setOptions({
                signer: {
                    preAuthTx: refundTx.hash(),
                    weight: 4,
                },
                source: holdingAccountPublicKey,
            }))

            // Configure signing thresholds.
            // Set master weight to 0 (so holding account can't sign it's own txs).
            // Set thresholds for all signing levels to 2 so 2 signatures are required.
            .addOperation(Stellar.Operation.setOptions({
                masterWeight: 0,
                lowThreshold: 4,
                medThreshold: 4,
                highThreshold: 4,
                source: holdingAccountPublicKey,
            }))
            .build();

        return { holdingTx, claimTx, refundTx };
    }

    return {
        createHoldingAccount,
        finalizeHoldingAccount,
    };
}

module.exports = HashedTimelockContracts;