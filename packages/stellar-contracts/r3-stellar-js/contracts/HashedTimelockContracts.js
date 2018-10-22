'use strict';

function HashedTimelockContracts(stellar, Stellar) {

    const makeHoldingKeys = async () => {
        const holdingKeys = Stellar.Keypair.random();
        return { holdingKeys };
    }

    const createHoldingAccount = async ({
        asset,
        hashlock,
        swapAmount,
        refundTime,
        baseReserve,
        depositorAccountPublicKey,
        claimerAccountPublicKey,
        holdingAccountPublicKey,
    }) => {
        let depositor = await stellar.loadAccount(depositorAccountPublicKey);

        depositor.incrementSequenceNumber();

        // Prepare the refund transaction first.
        const refundTx = new Stellar.TransactionBuilder(claimer, {
            timebounds: {
                refundTime,
                maxTime: 0,
            },
        })

        // Merge accounts of original depositor and holding account.
        .addOperation(Stellar.Operation.accountMerge({
            destination: depositorAccountPublicKey,
            source: holdingAccountPublicKey,
        }))
        .build();

        depositor = await stellar.loadAccount(depositorAccountPublicKey);

        // Create the actual holding transaction.
        const holdingTx = new Stellar.TransactionBuilder(depositor)
            // Create holding account.
            // 5 = 2 + 1 hashlock signer + 1 claimer signer + 1 asset trustline
            .addOperation(Stellar.Operation.createAccount({
                destination: holdingAccountPublicKey,
                startingBalance: 5 * baseReserve,
            }))

            // Set trustline for asset for holding account.
            .addOperation(Stellar.Operation.changeTrust({
                asset: asset,
                limit: swapAmount,
                source: holdingAccountPublicKey,
            }))

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

            // Preauthorize refund transaction
            .addOperation(Stellar.Operation.setOptions({
                signer: {
                    preAuthTx: refundTx.hash(),
                    weight: 2,
                },
                source: holdingAccountPublicKey,
            }))

            // Configure signing thresholds.
            // Set master weight to 0 (so holding account can't sign it's own txs).
            // Set thresholds for all signing levels to 2 so 2 signatures are required.
            .addOperation(Stellar.Operation.setOptions({
                masterWeight: 0,
                lowThreshold: 2,
                medThreshold: 2,
                highThreshold: 2,
                source: holdingAccountPublicKey,
            }))
            .build();

        return { refundTx, holdingTx };
    }

    const depositToHoldingAccount = async ({
        asset,
        swapAmount,
        depositorAccountPublicKey,
        holdingAccountPublicKey,
    }) => {
        const depositor = await stellar.loadAccount(depositorAccountPublicKey);
        const moveTx = new Stellar.TransactionBuilder(depositor)
            .addOperation(Stellar.Operation.payment({
                asset: asset,
                amount: swapAmount,
                destination: holdingAccountPublicKey,
                source: depositorAccountPublicKey,
            }))
            .build();

        return { moveTx };
    }

    const claimFromHoldingAccount = async ({
        claimerAccountPublicKey,
        holdingAccountPublicKey
    }) => {
        const holding = await stellar.loadAccount(holdingAccountPublicKey);
        const claimTx = new Stellar.TransactionBuilder(holding)
            .addOperation(Stellar.Operation.accountMerge({
                destination: claimerAccountPublicKey,
                source: holdingAccountPublicKey,
            }))
            .build();

        return { claimTx };
    }

    return {
        createHoldingAccount,
        depositToHoldingAccount,
        claimFromHoldingAccount,
    };
}

module.exports = HashedTimelockContracts;