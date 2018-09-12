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
Tests are wirtten using [Jest](https://jestjs.io/) library.
Run `npm test` to run all the tests.

## Documentation
Comments in this project follow the [JSDoc](http://usejsdoc.org/index.html) format.
To generate documentation, run `jsdoc -d=your_path wallet.js` or `jsdoc -d=your_path ethereum_wallet.js`.
## Built With
* [stellar-hd-wallet](https://www.npmjs.com/package/stellar-hd-wallet) - Key derivation for Stellar (SEP-0005)
* [forge](https://www.npmjs.com/package/node-forge) - A native implementation of TLS (and various other cryptographic tools)
