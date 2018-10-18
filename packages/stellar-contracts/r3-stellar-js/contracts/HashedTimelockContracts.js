'use strict';

export function HashedTimelockContracts(stellar, Stellar) {

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
        depositorAccountAddress,
        claimerAccountAddress,
        holdingAccountAddress,
    }) => {
        let depositor = await stellar.loadAccount(depositorAccountAddress);

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
            destination: depositorAccountAddress,
            source: holdingAccountAddress,
        }))
        .build();

        depositor = await stellar.loadAccount(depositorAccountAddress);

        // Create the actual holding transaction.
        const holdingTx = new Stellar.TransactionBuilder(depositor)
            // Create holding account.
            // 5 = 2 + 1 hashlock signer + 1 claimer signer + 1 asset trustline
            .addOperation(Stellar.Operation.createAccount({
                destination: holdingAccountAddress,
                startingBalance: 5 * baseReserve,
            }))

            // Set trustline for asset for holding account.
            .addOperation(Stellar.Operation.changeTrust({
                asset: asset,
                limit: swapAmount,
                source: holdingAccountAddress,
            }))

            // Add claimer as signer.
            .addOperation(Stellar.Operation.setOptions({
                signer: {
                    ed25519PublicKey: claimerAccountAddress,
                    weight: 1,
                },
                source: holdingAccountAddress,
            }))

            // Set hashlock signer.
            .addOperation(Stellar.Operation.setOptions({
                signer: {
                    sha256Hash: hashlock,
                    weight: 1,
                },
                source: holdingAccountAddress,
            }))

            // Preauthorize refund transaction
            .addOperation(Stellar.Operation.setOptions({
                signer: {
                    preAuthTx: refundTx.hash(),
                    weight: 2,
                },
                source: holdingAccountAddress,
            }))

            // Configure signing thresholds.
            // Set master weight to 0 (so holding account can't sign it's own txs).
            // Set thresholds for all signing levels to 2 so 2 signatures are required.
            .addOperation(Stellar.Operation.setOptions({
                masterWeight: 0,
                lowThreshold: 2,
                medThreshold: 2,
                highThreshold: 2,
                source: holdingAccountAddress,
            }))
            .build();

        return { refundTx, holdingTx };
    }

    const depositToHoldingAccount = async ({
        asset,
        swapAmount,
        depositorAccountAddress,
        holdingAccountAddress,
    }) => {
        const depositor = await stellar.loadAccount(depositorAccountAddress);
        const moveTx = new Stellar.TransactionBuilder(depositor)
            .addOperation(Stellar.Operation.payment({
                asset: asset,
                amount: swapAmount,
                destination: holdingAccountAddress,
                source: depositorAccountAddress,
            }))
            .build();

        return { moveTx };
    }

    const claimFromHoldingAccount = async ({
        claimerAccountAddress,
        holdingAccountAddress
    }) => {
        const holding = await stellar.loadAccount(holdingAccountAddress);
        const claimTx = new Stellar.TransactionBuilder(holding)
            .addOperation(Stellar.Operation.accountMerge({
                destination: claimerAccountAddress,
                source: holdingAccountAddress,
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