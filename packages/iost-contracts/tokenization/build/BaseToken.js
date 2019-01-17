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

    // One-time deploy token.
    // No effect if deploy has been called before.
    deploy(name, symbol, decimals, issuer) {
      // Check if token is deployed already.
      if (storage.get('deployed') === 'f') {
        storage.put('deployed', 't');
        storage.put('name', name);
        storage.put('symbol', symbol);
        storage.put('issuer', issuer);
        storage.put('totalSupply', '0');
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
      let value = storage.get('totalSupply');
      return value;
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

      let currentSupply = storage.get('totalSupply');
      if (currentSupply === null) {
        throw 'NULL_TOTAL_SUPPLY';
      } else {
        currentSupply = new BigNumber(currentSupply);
      }

      let newAmount = currentAmount.plus(issueAmount);
      let newSupply = currentSupply.plus(issueAmount);

      storage.mapPut('balances', to, newAmount.toString());
      storage.put('totalSupply', newSupply.toString());

      return JSON.stringify({ to, amount });
    }

    transfer(from, to, amount, memo) {
      if (!blockchain.requireAuth(tx.publisher, "active")) {
        throw 'PERMISSION_DENIED';
      }

      let sendAmount = new BigNumber(amount);
      if (!sendAmount.isInteger()) {
        throw 'INTEGER_VALUE_REQUIRED';
      }

      let currentFromAmount = storage.mapGet('balances', from);
      if (currentFromAmount === null) {
        currentFromAmount = new BigNumber(0);
      } else {
        currentFromAmount = new BigNumber(currentFromAmount);
      }

      let currentToAmount = storage.mapGet('balances', to);
      if (currentToAmount === null) {
        currentToAmount = new BigNumber(0);
      } else {
        currentToAmount = new BigNumber(currentToAmount);
      }

      // if (sendAmount.isGreaterThan(currentFromAmount)) {
      //   throw 'INSUFFICIENT_FUNDS';
      // }

      let newFromAmount = currentFromAmount.minus(sendAmount);
      let newToAmount = currentToAmount.plus(sendAmount);

      storage.mapPut('balances', from, newFromAmount.toString());
      storage.mapPut('balances', to, newToAmount.toString());

      return JSON.stringify({ from, to, amount });
    }

    burn(from, amount) {

    }

    can_update(data) {
    }
}
module.exports = BaseToken;
