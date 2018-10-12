# Some document history smart contract

## Requirements

- truffle
- ganache-cli
- Uses openzeppelin 1.10.0 templates

## Public Key Cryptography with GnuPG

### Generation of new key

We will be using elliptic curve cryptography, specifically secp256k1 which is also the curve that is used in ethereum.

1. Use the expert mode to generate a new key.
   ```
   gpg2 --expert --full-gen-key
   ```
2. Select `ECC and ECC` for the kind of key.
3. Select `secp256k1` for the elliptic curve.
4. Set the expiry.
5. Enter the name, email address and comments for this key.
6. Enter a passphrase to encrypt this key.

### Encryption and signing of files

Given a file `passport.jpg` and a recipient public key with ID `test@rate3.network`, we can encrypt and sign the file so that only the recipient can decrypt the file with his private key.
```
gpg2 --output passport.jpg.gpg --encrypt --sign --recipient test@rate3.network -u test@rate3.network passport.jpg
```

### Decryption and verification of files

Likewise, given a file `passport.jpg.gpg` and a recipient private key with ID `test@rate3.network`, we can decrypt the file.
```
gpg2 --output passport.jpg --decrypt --recipient test@rate3.network passport.jpg.gpg
```

### Demo file

We have hosted a sample encrypted document on IPFS for the purpose of this demo. This document has a hash of `QmZEG1mA8eGfiD5RtrWZQ95LFdU5DPhpez7dqxBe7VY8zH` and it can be accessed [here](https://ipfs.io/ipfs/QmZEG1mA8eGfiD5RtrWZQ95LFdU5DPhpez7dqxBe7VY8zH).

We have encrypted this file with our public key, so it can only be decrypted with our private key. The file contents are gibberish at the moment, but we have provided a simple tool to decrypt this document.

For the sake of this demo, here is our private key and passphrase for anyone to decrypt the file.

**Private Key:**
```
-----BEGIN PGP PRIVATE KEY BLOCK-----

lKIEW1rS/RMFK4EEAAoCAwTwGRBkRVjKdY2fUuAoI0B+b6CRiF15iGQ3+mTMiZS4
KhZ8gR3WLkIgq5ecfAhGYZPzfeolOh6RRXyfTwhpQ7GK/gcDAo2BqhUkxkiX5XC4
HuCBuWo1Q09Cllc5Z2gfAfgA0uDjSEzdMUjo8Ic1+TRS/816up6k9PXmJOnGeAPN
6DsbOF8xCZEYBH1iRmIdbkRs2H60MlJhdGUgVGVzdCAoRm9yIGRlbW8gcHVycG9z
ZXMpIDx0ZXN0QHJhdGUzLm5ldHdvcms+iJAEExMIADgWIQSitSPGBRiFsQ8cG4fU
lkZfyqFZWQUCW1rS/QIbAwULCQgHAgYVCgkICwIEFgIDAQIeAQIXgAAKCRDUlkZf
yqFZWQA2AP4jgBIK9MeWdVyYHqAEafyfrZV4EGnkA1FcVi+zlTnEOgD/dSxncLYw
l3jlWY4Wuu6Da+/rXvHYST0ha8AZNMnLO2ucpgRbWtL9EgUrgQQACgIDBObvIPYb
gbtBSnI7nrA7E22OD/9GqxC3P7JLH5lnYJhcescfIJ9+cxQ7KSUzctF48amK3w9y
G6aH4cDpAQozdHYDAQgH/gcDAtv65uP79Uod5Za0rfxlog1phDmuIs58PBQ/LIMY
nYPNEv3+352FjSeS76UCuqVYe23jpCmRMErcsV2e4DF78Wu0NFBDsAHFrJELISVI
Z3iIeAQYEwgAIBYhBKK1I8YFGIWxDxwbh9SWRl/KoVlZBQJbWtL9AhsMAAoJENSW
Rl/KoVlZ8Y8BAL5tzFMCP6dG8uUFMWDFoh8hkDGVU+eWSeWXSTM9/2oUAQCl35BM
ERX5vAqSZMhGGmy3Qfo6tZdamsLd1jtfE0b41w==
=nGXB
-----END PGP PRIVATE KEY BLOCK-----
```

**Passphrase:** `testing123`


### Storing of documents

The smart contract does not actually store the document, instead it stores a reference to the document. In this case the reference is a IPFS hash. We are referring to the references to the documents when we mention documents in this readme.

In order to support multiple types of references (IPFS, Swarm, Storj, etc) together with validation during submission, the storage of documents is decoupled from the submission of documents.

#### DocHistory

The `DocHistory` contract will store the documents using events. Currently there is no need for other smart contracts to interact with the documents, so storing in events is the cheaper option.

Dapps can construct their own database/storage by reading off the event logs.

This contract also defines the types for the submitted documents, an example is `Passport`.

#### IpfsDoc

The `IpfsDoc` is only used for submitting IPFS documents to the `DocHistory` contract. This contract does a simple verification for the IPFS hash to ensure that it is in the correct format. The onus is on the dapp/user to ensure that the hash actually corresponds to an actual file on IPFS.

## Deployment

### Ropsten Testnet

Smart contracts deployment is done with Infura.

In the `.env` file, set up these environment variables:

```
MNEMONIC='<Insert Metamask Mnemonic here>'
INFURA_KEY='<Insert Infura API key here>'
```
Once that is done, run:
```
truffle migrate --network ropsten
```

### IPFS

The dApp is deployed to IPFS, hosted by Infura.

After running `npm run build`, everything in the `dist` folder needs to be deployed to IPFS.

`ipfs.js` is a simple script that will do this for us. To run this script, open the file and set the `ipfs` variable to the correct API endpoint, then run `node ipfs.js`.
