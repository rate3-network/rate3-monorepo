const rstorage = require('../libjs/storage.js');
const rBlockChain = require('../libjs/blockchain.js');
const storage = new rstorage();
const blockchain = new rBlockChain();

// This token can be extensible to more more customizable than the default
// Token20 standard
class BaseToken
{   
    // Execute everytime the contract class is called.
    constructor() {
    }

    // Execute once when contract is packed into a block.
    init() {
      storage.put('deployed', 'f');
    }

    // One-time deploy token.
    // No effect if deploy has been called before.
    deploy(name, symbol, decimals, issuer) {
      // Check if token is deployed already.
      if (storage.get('deployed') === 'f') {
        storage.put('deployed', 't');
        storage.put('name', name);
        storage.put('symbol', symbol);
        storage.put('issuer', issuer);

        storage.mapPut('balances', issuer, '0');

        blockchain.receipt(JSON.stringify(
          { name, symbol, decimals, issuer }
        ));
      } else {
        blockchain.receipt('ALREADY_DEPLOYED');
      }
    }

    name() {
      let value = storage.get('name');
      return value;
    }

    symbol() {
      let value = storage.get('symbol');
      return value;
    }

    issuer() {
      let value = storage.get('issuer');
      return value;
    }

    deployed() {
      let value = storage.get('deployed');
      return value;
    }

    balanceOf(from) {
      let value = storage.mapGet('balances', from);
      return value;
    }

    totalSupply() {
    }

    issue(to, amount) {
      if (!blockchain.requireAuth(tx.publisher, "active")) {
        throw 'PERMISSION_DENIED';
      }

      let issueAmount = new BigNumber(amount);

      if (!issueAmount.isInteger()) {
        throw 'INTEGER_VALUE_REQUIRED';
      }

      let currentAmount = storage.mapGet('balances', to);

      if (currentAmount === null) {
        currentAmount = new BigNumber(0);
      } else {
        currentAmount = new BigNumber(currentAmount);
      }

      let newAmount = currentAmount.plus(issueAmount);

      storage.mapPut('balances', to, newAmount.toString());

      blockchain.receipt(JSON.stringify({ to, amount }));
    }

    transfer(from, to, amount, memo) {

    }

    burn(from, amount) {
    }

    can_update(data) {
    }
};
module.exports = BaseToken;
