const rstorage = require('../libjs/storage.js');
const rBlockChain = require('../libjs/blockchain.js');
const storage = new rstorage();
const BlockChain = new rBlockChain();

class BaseToken
{   
    // Execute everytime the contract class is called.
    constructor() {
    }

    // Execute once when contract is packed into a block.
    init() {
      storage.put('deployed', 'f');
    }

    deploy(name, symbol, decimals, issuer) {
      // Check if token is deployed already.

      // One-tiem deploy token.
      storage.put('deployed', 't');
      storage.put('name', name);
      storage.put('symbol', symbol);
      storage.put('issuer', issuer);

      storage.mapPut('balances', issuer, '0');
    }

    name() {
    }

    symbol() {
    }

    issuer() {
    }

    deployed() {
    }

    balanceOf(from) {
    }

    totalSupply() {
    }

    issue(to, amount) {
    
    }

    transfer(from, to, amount, memo) {

    }

    burn(from, amount) {
    }

    can_update(data) {
    }
};
module.exports = BaseToken;
