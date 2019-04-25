## Setup Docker
- Run Docker container
    docker run -d --rm -p 30000-30003:30000-30003 iostio/iost-node
- Copy contracts over 
    docker cp build/. <container id>:/workdir/build
- Use image bash terminal
    docker exec -it <container id> /bin/bash

## Import Inital Admin
    iwallet account import admin 2yquS3ySrGWPEKywCPzX4RTJugqRh7kJSo5aehsLYPEWkUxBWA39oMrZ7ZxuM4fgyXYs2cPwh5n8aNNpH5x2VyK1

## Create Account Users
    iwallet --account admin --amount_limit '*:unlimited' account create user2 --initial_balance 100000 --initial_gas_pledge 100000 --initial_ram 100000
    iwallet --account admin --amount_limit '*:unlimited' account create user3 --initial_balance 100000 --initial_gas_pledge 100000 --initial_ram 100000
    iwallet --account admin --amount_limit '*:unlimited' account create user4 --initial_balance 100000 --initial_gas_pledge 100000 --initial_ram 100000
    iwallet --account admin --amount_limit '*:unlimited' account create userb --initial_balance 100000 --initial_gas_pledge 100000 --initial_ram 100000

## Publish Contract
    iwallet --expiration 90 --gas_limit 1000000 --gas_ratio 1 --account admin --amount_limit '*:unlimited' publish build/BaseToken.js build/BaseToken.json

## Deploy Token
- User cannot call deploy
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "deploy" '["IOST TetherUS","iusdt","2"]'
**Expected Result: Error: PERMISSION_DENIED**

- Admin calls deploy
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "deploy" '["IOST TetherUS","iusdt","2"]'
**Expected Result: SUCCESS**

- Admin calls deploy again
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "deploy" '["IOST TetherUS","iusdt","2"]'
**Expected Result: Error: ALREADY DEPLOYED**

## Blacklist User
- Must have permission to blacklist user
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account userb --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "blacklist" '["userb",true]'
**Expected Result: Error: PERMISSION_DENIED**

- Admin blacklist user
     iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "blacklist" '["userb",true]'
**Expected Result: SUCCESS**

## Issue Token
- User cannot issue token
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "issue" '["iusdt","user2","500.05"]'
**Expected Result: Error: PERMISSION_DENIED**

- Admin issue token
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "issue" '["iusdt","user2","500.05"]'
**Expected Result: SUCCESS**

- Check balanceOf
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "balanceOf" '["iusdt","user2"]'
**Expected Result: SUCCESS**

- Cannot issue if token_name(symbol) does not match
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "issue" '["random","user2","500.05"]'
**Expected Result: Error: TOKEN_DOES_NOT_MATCH**

- Cannot issue if blacklisted
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "issue" '["iusdt","userb","500.05"]'
**Expected Result: Error: ID_BLACKLISTED**

## Transfer Tokens
- Must have permission to transfer tokens from from_account
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "transfer" '["iusdt","user2","user3","500.05",""]'
**Expected Result: Error: transaction has no permission**

- Must have enough balance to transfer
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "transfer" '["iusdt","user2","user3","501",""]'
**Expected Result: Error: balance not enough 500.05 < 501**

- Cannot transfer if token_name(symbol) does not match
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "transfer" '["random","user2","user3","500.05",""]'
**Expected Result: Error: TOKEN_DOES_NOT_MATCH**

- Cannot transfer if to account id does not exist
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "transfer" '["random","user2","random","500.05",""]'
**Expected Result: Error: invalid account random**

- Transferred balance must be of decimals
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "transfer" '["iusdt","user2","user3","500.053123",""]'
**Expected Result: SUCCESS (Receipt shows only 500.05 tokens transferred, fulfills decimals requirements)**

- Cannot transfer if blacklisted
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account userb --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "transfer" '["iusdt","userb","user3","500.053123",""]'
**Expected Result: Error: ID_BLACKLISTED**

    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account userb --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "transfer" '["iusdt","user3","userb","500.053123",""]'
**Expected Result: Error: ID_BLACKLISTED**

## TransferFreeze Tokens
- Issue tokens for user2 again
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "issue" '["iusdt","user2","500.1"]'

- Must have permission to transfer tokens from from_account
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "transferFreeze" '["iusdt","user2","user3","500.1",1903326232,""]'
**Expected Result: Error: transaction has no permission**

- Must have enough balance to transfer
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "transferFreeze" '["iusdt","user2","user3","501",1903326232,""]'
**Expected Result: Error: balance not enough 500.1 < 501**

- Cannot transfer if token_name(symbol) does not match
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "transferFreeze" '["random","user2","user3","500.1",1903326232,""]'
**Expected Result: Error: TOKEN_DOES_NOT_MATCH**

- Transferred balance must be of decimals
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "transferFreeze" '["iusdt","user2","user3","500.10123",1903326232,""]'
**Expected Result: SUCCESS (Receipt shows only 500.1 tokens transferred, fulfills decimals requirements)**

- Cannot transfer if blacklisted
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account userb --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "transferFreeze" '["iusdt","userb","user3","500.10123",1903326232,""]'
**Expected Result: Error: ID_BLACKLISTED**

    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account userb --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "transferFreeze" '["iusdt","user3","userb","500.10123",1903326232,""]'
**Expected Result: Error: ID_BLACKLISTED**

## Destroy(burn) Tokens
- Must have permission to transfer tokens from from_account
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "destroy" '["iusdt","user3","500"]'
**Expected Result: Error: transaction has no permission**

- Must have enough balance to destroy
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user3 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "destroy" '["iusdt","user3","501"]'
**Expected Result: Error: balance not enough 500 < 501**

- Cannot destroy if token_name(symbol) does not match
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user3 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "destroy" '["random","user3","500"]'
**Expected Result: Error: TOKEN_DOES_NOT_MATCH**

- Destroyed balance must be of decimals
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user3 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "destroy" '["iusdt","user3","500.001"]'
**Expected Result: SUCCESS (Receipt shows only 500 tokens destroyed, fulfills decimals requirements)**

- Cannot destroy if blacklisted
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account userb --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "destroy" '["iusdt","userb","500.001"]'
**Expected Result: Error: ID_BLACKLISTED**

## Convert Tokens
- Issue tokens for user4
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "issue" '["iusdt","user4","1500.1"]'

- Cannot destroy if token_name(symbol) does not match
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user4 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "convertToERC20" '["random","user4","1500.1", "0xb19fc71d25AD8Db1eA8ebD434A6A063cCe1124Ba"]'
**Expected Result: Error: TOKEN_DOES_NOT_MATCH**

- Ethereum address must be valid
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user4 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "convertToERC20" '["iusdt","user4","1500.1", "dasdas"]'
**Expected Result: Error: INVALID_ETH_ADDRESS_LENGTH**

    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user4 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "convertToERC20" '["iusdt","user4","1500.1", "0xb19fc71d25AD8Db1eA8ebD434A6A063cCe1124Ba"]'
**Expected Result: SUCCESS**

## Blacklist User
- Must have permission to blacklist user
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "blacklist" '["user2",true]'

- Admin blacklist user
     iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "blacklist" '["user2",true]'

# Change Issuer
- Must have permission to change issuer
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "changeIssuer" '["user2"]'
**Expected Result: Error: PERMISSION_DENIED**

- Admin change issuer
     iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "changeIssuer" '["user2"]'
**Expected Result: SUCCESS**

    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "issue" '["iusdt","user2","500.1"]'
**Expected Result: PERMISSION_DENIED**

    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "issue" '["iusdt","user2","500.1"]'
**Expected Result: SUCCESS**

- Issuer cannot change issuer, only admin/contract owner can
    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "changeIssuer" '["user3"]'
**Expected Result: Error: PERMISSION_DENIED**

    iwallet --expiration 90 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract7ybNwxBhKbCTQv4vwpuyxuATd1eBEzdQ7ovnpgV7D29X" "changeIssuer" '["user3"]'
**Expected Result: SUCCESS**