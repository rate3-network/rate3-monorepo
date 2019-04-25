const rstorage = require('../libjs/storage.js');
const rBlockChain = require('../libjs/blockchain.js');
const storage = new rstorage();
const blockchain = new rBlockChain();

class BaseToken {
  // Execute once when contract is packed into a block.
  init() {
    storage.put('deployed', 'f');
    storage.put('issuer', blockchain.publisher());
  }

  // One-time deploy token.
  // No effect if deploy has been called before.
  deploy(name, symbol, decimals) {
    this._checkIssuer();
    // Check if token is deployed already.
    if (storage.get('deployed') === 'f') {
      let issuer = storage.get('issuer');
      storage.put('deployed', 't');
      storage.put('name', name);
      storage.put('symbol', symbol);
      storage.put('decimals', decimals);

      blockchain.callWithAuth('token.iost', 'create', [
        symbol,
        blockchain.contractName(),
        90000000000000,
        {
          fullName: name,
          decimal: new BigNumber(decimals).toNumber(),
          canTransfer: true,
          onlyIssuerCanTransfer: true,
        }
      ]);

      blockchain.receipt(JSON.stringify(
        { name, symbol, decimals, issuer }
      ));
    } else {
      throw new Error('ALREADY_DEPLOYED');
    }
  }

  can_update(data) {
    return blockchain.requireAuth(blockchain.contractOwner(), 'active');
  }

  balanceOf(token_name, owner) {
    this._checkToken(token_name);
    return this._call('token.iost', 'balanceOf', [token_name, owner]);
  }

  supply(token_name) {
    this._checkToken(token_name);
    return this._call('token.iost', 'supply', [token_name]);
  }

  totalSupply(token_name) {
    this._checkToken(token_name);
    return this._call('token.iost', 'totalSupply', [token_name]);
  }

  issue(token_name, to, amount) {
    this._checkIssuer();
    this._checkToken(token_name);
    this._checkBlacklist(to);

    amount = this._amount(amount);
    blockchain.callWithAuth('token.iost', 'issue', [token_name, to, amount]);
  }

  transfer(token_name, from, to, amount, memo) {
    this._checkToken(token_name);
    this._checkBlacklist(from);
    this._checkBlacklist(to);

    amount = this._amount(amount);
    blockchain.callWithAuth('token.iost', 'transfer', [token_name, from, to, amount, memo])
  }

  transferFreeze(token_name, from, to, amount, timestamp, memo) {
    this._checkToken(token_name);
    this._checkBlacklist(from);
    this._checkBlacklist(to);

    amount = this._amount(amount);
    blockchain.callWithAuth('token.iost', 'transferFreeze', [token_name, from, to, amount, timestamp, memo]);
  }

  destroy(token_name, from, amount) {
    this._checkToken(token_name);
    this._checkBlacklist(from);

    amount = this._amount(amount);
    blockchain.callWithAuth('token.iost', 'destroy', [token_name, from, amount]);
  }

  convertToERC20(token_name, from, amount, ethAddress) {
    this._checkToken(token_name);
    this._checkEthAddressValid(ethAddress);

    this.destroy(token_name, from, amount);

    blockchain.receipt(JSON.stringify(
      { action: 'convertToERC20', from, amount, ethAddress }
    ));
    return JSON.stringify({ from, amount, ethAddress });
  }

  blacklist(id, bool) {
    this._checkIssuer();
    this._checkIdValid(id);

    if (bool) {
      storage.mapPut('blacklist', id, 't');
    } else {
      storage.mapPut('blacklist', id, 'f');
    }

    blockchain.receipt(JSON.stringify(
      { action: 'blacklist', id, bool }
    ));
  }

  changeIssuer(issuer) {
    this._checkIdValid(issuer);

    // Must be owner.
    if (!blockchain.requireAuth(blockchain.contractOwner(), 'active')) {
      throw new Error('PERMISSION_DENIED');
    }
    storage.put('issuer', issuer);
  }

  _amount(amount) {
    let decimals = storage.get('decimals');
    return new BigNumber(new BigNumber(amount).toFixed(new BigNumber(decimals).toNumber()));
  }

  // Call abi and parse result as JSON string.
  _call(contract, api, args) {
    const ret = blockchain.callWithAuth(contract, api, args);
    if (ret && Array.isArray(ret) && ret.length >= 1) {
      return ret[0];
    }
    return null;
  }

  _checkToken(token_name) {
    let symbol = storage.get('symbol');
    if (token_name !== symbol) {
        throw new Error('TOKEN_DOES_NOT_MATCH');
    }
  }

  _checkIssuer() {
    let issuer = storage.get('issuer');
    if (!blockchain.requireAuth(issuer, 'active')) {
      throw new Error('PERMISSION_DENIED');
    }
  }

  _checkBlacklist(id) {
    let blacklisted = storage.mapGet('blacklist', id);
    if (blacklisted === 't') {
      throw new Error('ID_BLACKLISTED');
    }
  }

  _checkIdValid(id) {
    if (block.number === 0) {
      return;
    }
    if (id.length < 5 || id.length > 11) {
      throw new Error('INVALID_ID_LENGTH');
    }
    if (id.startsWith('Contract')) {
      throw new Error('ID_IS_CONTRACT');
    }
    for (let i in id) {
      let ch = id[i];
      if (!(ch >= 'a' && ch <= 'z' || ch >= '0' && ch <= '9' || ch === '_')) {
        throw new Error('INVALID_ID_CHAR');
      }
    }
    let account = storage.globalMapGet('auth.iost', 'auth', id);
    if (account === null) {
      throw new Error('ACCOUNT_DOES_NOT_EXIST');
    }
  }

  _checkEthAddressValid(address) {
    if (address.length != 42) {
      throw new Error('INVALID_ETH_ADDRESS_LENGTH');
    }

    if (!address.startsWith('0x')) {
      throw new Error('INVALID_ETH_ADDRESS_PREFIX');
    }

    address = address.replace('0x','');
    address = address.toLowerCase();

    for (let i in address) {
      let ch = address[i];
      if (!(ch >= 'a' && ch <= 'f' || ch >= '0' && ch <= '9')) {
        throw new Error('INVALID_ETH_ADDRESS_CHAR');
      }
    }
    return true;
  };
};
module.exports = BaseToken;
