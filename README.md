# Wallet Management JS module
This is a wallet management JavaScript module for Stellar and Ethereum.
## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
### Prerequisites
* [Node](https://nodejs.org/en/download/)
* [NPM](https://www.npmjs.com/), installed by the command `npm install npm@latest -g`.
### Installing
1. Clone or download the repo.
2. Run `npm install` in this directory in the command line.
## Running the tests
* Tests are wirtten using [Jest](https://jestjs.io/) library.
* Run `npm test` to run all the tests.
* You can configure testing in the `package.json` file, or by adding arguments to the command.
* From the test cases you can see how to use this package.
* Ledger/Trezor integration is not tested with the hardware devices.
## Documentation
* Comments in this project follow the [JSDoc](http://usejsdoc.org/index.html) format.
* Run the following command to create the documentation for a certain `.js` file. For example `jsdoc Account.js`.
* Run `jsdoc Ledger.js WalletManager.js Trezor.js Account.js -d Docs` to generate documentation for all in the Docs folder.
* The [documentation](Docs/index.html) is in the `out` or `Docs` folder. You can view it in the browser.
### Development Plan
* [Development Plan](https://drive.google.com/open?id=1dW2DiS1rvbvnWDNURoTbekyViuE3FPY7)
* Also, see this [issue](https://github.com/rate-engineering/rate3-monorepo/issues/9).
* My current progress is at the end of Phase 3 (out of 6 phases), plus Ledger and Trezor integration.
## Built With
* [bip39](https://www.npmjs.com/package/bip39) - Mnemonic code for generating deterministic keys
* [ethereumjs-wallet](https://www.npmjs.com/package/ethereumjs-wallet) - A lightweight Ethereum wallet implementation
* [forge](https://www.npmjs.com/package/node-forge) - A native implementation of TLS (and various other cryptographic tools)
* [request-promise](https://www.npmjs.com/package/request-promise) - The simplified HTTP request client 'request' with Promise support.
* [stellar-hd-wallet](https://www.npmjs.com/package/stellar-hd-wallet) - Key derivation for Stellar (SEP-0005)
* [stellar-sdk](https://www.npmjs.com/package/stellar-sdk) - Communicating with a Stellar Horizon server
* [web3](https://www.npmjs.com/package/web3) - A collection of libraries which allow you to interact with a local or remote ethereum node, using a HTTP or IPC connection
* [ledgerjs](https://github.com/LedgerHQ/ledgerjs) - Libraries to communicate with Ledger Nano / Nano S / Blue applications. There are implementations for Node and Browser.
* [trezor-connect](https://www.npmjs.com/package/trezor-connect) - Trezor API with functionality to access public keys, sign transactions and authenticate users.