# Wallet Management JS module
This is a wallet management JavaScript module for Stellar and Ethereum.
## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
### Prerequisites
* [Node](https://nodejs.org/en/download/)
* NPM, installed by the command `npm install npm@latest -g`.
### Installing
1. Clone or download the repo.
2. Run `npm install` in this directory in the command line.
## Running the tests
* Tests are wirtten using [Jest](https://jestjs.io/) library.
* Run `npm test` to run all the tests.
* You can configure it in the `package.json` file, or by adding arguments to the command.
* From the test cases you can see how to use this package.
## Documentation
* Comments in this project follow the [JSDoc](http://usejsdoc.org/index.html) format.
* Run the following command to create the documentation `jsdoc Account.js WalletManager.js`.
* The [documentation](Docs/index.html) is in the `out` or `Docs` folder. You can view it in the browser.
### Development Plan
* [Development Plan](https://drive.google.com/open?id=1dW2DiS1rvbvnWDNURoTbekyViuE3FPY7)
* My current progress is at the end of Phase 2.
* By the end of my internship, my plan is to complete phase 4.
## Built With
* [bip39](https://www.npmjs.com/package/bip39) - Mnemonic code for generating deterministic keys
* [ethereumjs-wallet](https://www.npmjs.com/package/ethereumjs-wallet) - A lightweight Ethereum wallet implementation
* [forge](https://www.npmjs.com/package/node-forge) - A native implementation of TLS (and various other cryptographic tools)
* [request-promise](https://www.npmjs.com/package/request-promise) - The simplified HTTP request client 'request' with Promise support.
* [stellar-hd-wallet](https://www.npmjs.com/package/stellar-hd-wallet) - Key derivation for Stellar (SEP-0005)
* [stellar-sdk](https://www.npmjs.com/package/stellar-sdk) - Communicating with a Stellar Horizon server
* [web3](https://www.npmjs.com/package/web3) - A collection of libraries which allow you to interact with a local or remote ethereum node, using a HTTP or IPC connection