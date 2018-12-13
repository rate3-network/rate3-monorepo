'use strict';

function AssetContracts(stellar, Stellar) {

    const trustIssuingAccount = async ({
        asset,
        amount,
        accountPublicKey,
    }) => {
        const opts = {
            asset: asset,
        };

        if (amount) {
            opts.limit = amount;
        }

        const account = await stellar.loadAccount(accountPublicKey);
        const tx = new Stellar.TransactionBuilder(account)
            // The `changeTrust` operation creates (or alters) a trustline.
            // The `limit` parameter below is optional.
            .addOperation(Stellar.Operation.changeTrust(opts))
            .build();

        return { tx };
    }

    const mintAsset = async ({
        asset,
        amount,
        issuingAccountPublicKey,
        distributionAccountPublicKey,
    }) => {      
        const issuer = await stellar.loadAccount(issuingAccountPublicKey);
        const tx = new Stellar.TransactionBuilder(issuer)
            .addOperation(Stellar.Operation.payment({
                asset: asset,
                destination: distributionAccountPublicKey,
                amount: String(amount),
            }))
            .build();

        return { tx };
    }

    const distributeAsset = async ({
        asset,
        amount,
        distributionAccountPublicKey,
        destinationAccountPublicKey,
    }) => {      
        const distributor = await stellar.loadAccount(distributionAccountPublicKey);
        const tx = new Stellar.TransactionBuilder(distributor)
            .addOperation(Stellar.Operation.payment({
                asset: asset,
                destination: destinationAccountPublicKey,
                amount: String(amount),
            }))
            .build();

        return { tx };
    }

    const burnAsset = async ({
        asset,
        amount,
        issuingAccountPublicKey,
        burnerAccountPublicKey,
    }) => {      
        const burner = await stellar.loadAccount(burnerAccountPublicKey);
        const tx = new Stellar.TransactionBuilder(burner)
            .addOperation(Stellar.Operation.payment({
                asset: asset,
                destination: issuingAccountPublicKey,
                amount: String(amount),
            }))
            .build();

        return { tx };
    }

    const convertAssetToEthereumToken = async ({
        asset,
        amount,
        issuingAccountPublicKey,
        converterAccountPublicKey,
        ethereumAccountAddress,
    }) => {      
        const converter = await stellar.loadAccount(converterAccountPublicKey);
        // <eth: + ethereum address>.
        const rMemoHash = '00000000006500740068003A' + ethereumAccountAddress;
        const tx = new Stellar.TransactionBuilder(converter)
            .addOperation(Stellar.Operation.payment({
                asset: asset,
                destination: issuingAccountPublicKey,
                amount: String(amount),
            }))
            .addMemo(Stellar.Memo.hash(rMemoHash))
            .build();

        return { tx };
    }

    const convertEthereumTokenToAsset = async ({
        asset,
        amount,
        distributionAccountPublicKey,
        converterAccountPublicKey,
        ethereumAccountAddress,
    }) => {      
        const distributor = await stellar.loadAccount(distributionAccountPublicKey);
        // <eth: + ethereum address>.
        const rMemoHash = '00000000006500740068003A' + ethereumAccountAddress;
        const tx = new Stellar.TransactionBuilder(distributor)
            .addOperation(Stellar.Operation.payment({
                asset: asset,
                destination: converterAccountPublicKey,
                amount: String(amount),
            }))
            .addMemo(Stellar.Memo.hash(rMemoHash))
            .build();

        return { tx };
    }

    const setAssetAuthorization = async ({
        asset,
        issuingAccountPublicKey,
        authorization,
    }) => {
        const opts = {};

        if (authorization = 'required') {
            opts.setFlags = Stellar.AuthRequiredFlag;
        } else if (authorization = 'revocable') {
            opts.setFlags = Stellar.AuthRevocableFlag;
        } else if (authorization = 'immutable') {
            opts.setFlags = Stellar.AuthImmutableFlag;
        }

        const issuer = await stellar.loadAccount(issuingAccountPublicKey);
        const tx = new Stellar.TransactionBuilder(issuer)
            .addOperation(Stellar.Operation.setOptions(opts))
            .build();

        return { tx };
    }

    return {
        trustIssuingAccount,
        mintAsset,
        distributeAsset,
        burnAsset,
        convertAssetToEthereumToken,
        convertEthereumTokenToAsset,
        setAssetAuthorization,
    };
}

module.exports = AssetContracts;