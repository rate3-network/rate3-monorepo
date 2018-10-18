# ethereum-contracts
Contains the Rate3 Protocol ethereum based contracts
* Identity
* Tokenization

## Setup

1. Install relvant packages with npm:

`npm install`

2. Compile contracts with Truffle:

`truffle compile`

## Tests
We use the Truffle testing framework with chai.

#### To run the full test suite:

`truffle test`

#### To test only a specific protocol (eg. tokenization only) contracts:

`truffle test test/tokenization/*.js`


## Migration
Due to truffle 5 not being released yet that has a better migration pattern, a
temporary solution is used to deploy tokenization contracts.

`truffle migrate -f 4 --network development`
