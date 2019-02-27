## Setup Docker
- Run Docker container
    docker run -d --rm -p 30000-30003:30000-30003 iostio/iost-node
- Copy contracts over 
    docker cp build/. <container id>:/workdir/build
- Use image bash terminal
    docker exec -it <container id> /bin/bash

## Import Inital Admin
    ./iwallet account import admin 2yquS3ySrGWPEKywCPzX4RTJugqRh7kJSo5aehsLYPEWkUxBWA39oMrZ7ZxuM4fgyXYs2cPwh5n8aNNpH5x2VyK1

## Create Account Users
    ./iwallet --account admin --amount_limit '*:unlimited' account create user2 --initial_balance 100000 --initial_gas_pledge 100000 --initial_ram 100000
    ./iwallet --account admin --amount_limit '*:unlimited' account create user3 --initial_balance 100000 --initial_gas_pledge 100000 --initial_ram 100000
    ./iwallet --account admin --amount_limit '*:unlimited' account create user4 --initial_balance 100000 --initial_gas_pledge 100000 --initial_ram 100000

## Deploy Contract
    ./iwallet --expiration 50000 --gas_limit 1000000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' publish build/BaseToken.js build/BaseToken.json

# Unpause Contract
- User cannot pause/unpause
- Admin can pause if not already paused
- Admin can unpause if not already unpaused
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "unpause" "[]"

## Call Transaction
- User cannot call deploy
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "deploy" '["IOST Circle USD","IUSDC","18"]'
- Admin calls deploy
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "deploy" '["IOST Circle USD","IUSDC","18"]'

## Issue Token
- User cannot issue token
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "issue" '["admin","100000000000000000000000","0"]'
- Admin issue token
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "issue" '["admin","1000000000000000000000000","0"]'
- Token amount must be INTEGER
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "issue" '["admin","10.32","0"]'
- Token amount must be NON-NEGATIVE
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "issue" '["admin","-10000000000","0"]'
- Token amount must be within UINT256
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "issue" '["user3","1.15792089237316195423570985008687907853269984665640564039457584007913129639934e+77","0"]'
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "issue" '["user3","1e+77","0"]'
- IOST account must be valid
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "issue" '["gg","1000000000","0"]'
- IOST account is not blacklisted

## Transfer Tokens
- Can only transfer tokens from own balance
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "transfer" '["admin","user2","50000000000000000000000",""]'

    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "transfer" '["user2","admin","50000000000000000000000",""]'

    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "transfer" '["admin","user2","50000000000000000000000",""]'
- Token amount must be INTEGER
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "transfer" '["admin","user2","10.32",""]'
- Token amount must be NON-NEGATIVE
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "transfer" '["admin","user2","-10000000000",""]'
- Token amount must be within UINT256
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user3 --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "transfer" '["user3","user4","1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77",""]'
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "transfer" '["admin","user4","1",""]'
- IOST account must be valid
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "transfer" '["admin","gg","10000",""]'
- IOST account is not blacklisted

## Burn Tokens
- Can only burn tokens from own balance
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "burn" '["admin","1000"]'

    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "burn" '["admin","1000"]'
- Token amount must be INTEGER
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "burn" '["admin","10.32"]'
- Token amount must be NON-NEGATIVE
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "burn" '["admin","-1000"]'
- Token amount must be within UINT256
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user4 --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "burn" '["user4","1.15792089237316195423570985008687907853269984665640564039457584007913129639936e+77"]'

    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user4 --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "burn" '["user4","1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77"]'
- IOST account must be valid
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "burn" '["gg","300000"]'
- IOST account is not blacklisted

## Convert Tokens
- Ethereum address must be valid
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "convertToERC20" '["admin","3000", "dasdas"]'

    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "convertToERC20" '["user2","3000", "0xb19fc71d25AD8Db1eA8ebD434A6A063cCe1124Ba"]'

## Blacklist User
- Admin blacklist user
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract71LbVxABg2crhEe6G6Rv64e6tYJtoJpNUJzt9heefiT5" "blacklist" '["user2",true]'
- IOST account must be valid