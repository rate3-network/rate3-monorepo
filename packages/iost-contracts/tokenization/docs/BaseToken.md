## States
---
Contract state can be assessed by contract storage using:
```blockchain.getContractStorage(id, key, field, by_longest_chain)```

### name
Name of the token, usually the name of the wrapped ERC20 token, prefixed with 'IOST'.
```key=name```

### symbol
Symbol of the token, usually the symbol of the wrapped ERC20 token, prefixed with 'I'.
```key=symbol```

### totalSupply
Total supply of token.
```key=totalSupply```

### balances
Current token balance of an IOST Account.
```key=balances, field=<IOST ACCOUNT>```

### blacklist
Current blacklist status of an Account. Returns 't' or 'f' to represent true or false.
```key=blacklist, field=<IOST ACCOUNT>```

### pause
Current pause status of contract. Returns 't' or 'f' to represent true or false.
```key=pause```

### deployed
Current deployment status of contract. Returns 't' or 'f' to represent true or false.
```key=deployed```

### issuer
Current token contract issuer.
```key=issuer```

## Methods
---
### deploy(name, symbol, decimals)
**Permission required: issuer**
Called at the start after contract deployment to set the details of the token.
|param|type|description|
|---|---|---|
|name|string|Name of token|
|symbol|string|Symbol of token|
|decimals|string|Decimals of token|

### issue(to, amount, ethConversionId)
**Permission required: issuer**
Issue an amount of tokens to an IOST account.
|param|type|description|
|---|---|---|
|to|string|Tokens to be issued to|
|amount|string|Token amount to be issued|
|ethConversionId|string|Corresponding ethereum conversion id on conversion contract|

### transfer(from, to, amount, memo)
**Permission required: from**
Transfer an amount of tokens from an IOST account to another.
|param|type|description|
|---|---|---|
|from|string|Tokens to be transferred from|
|to|string|Tokens to be transferred to|
|amount|string|Token amount to be issued|
|memo|string|Memo|

### burn(from, amount)
**Permission required: from**
Burns an amount of tokens.
|param|type|description|
|---|---|---|
|from|string|Tokens to be burned from|
|amount|string|Token amount to be burned|

### convertToERC20(from, amount, ethAddress)
**Permission required: from**
Converts an amount of tokens to a specified ethereum address.
|param|type|description|
|---|---|---|
|from|string|Tokens to be converted from|
|amount|string|Token amount to be converted|
|ethAddress|string|Destination ethereum address for converted tokens|

### blacklist(id, bool)
**Permission required: issuer**
Blacklist or remove from whitelist for IOST accounts.
|param|type|description|
|---|---|---|
|id|string|IOST Account|
|bool|boolean|true to blacklist, false to remove from blacklist|