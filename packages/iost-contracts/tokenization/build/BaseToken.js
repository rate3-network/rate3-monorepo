"use strict";
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
      return storage.get('name');
    }

    symbol() {
      return storage.get('symbol');
    }

    issuer() {
      return storage.get('issuer');
    }

    deployed() {
      return storage.get('deployed');
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
}
module.exports = BaseToken;
