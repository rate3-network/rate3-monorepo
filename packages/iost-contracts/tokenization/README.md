## Setup Docker
- Run Docker container
    docker run -d --rm -p 30000-30003:30000-30003 iostio/iost-node
- Copy contracts over 
    docker cp build/. <container id>:/workdir/build
- Use image bash terminal
    docker exec -it <container id> /bin/bash

## Import Inital Admin
    ./iwallet account import admin 2yquS3ySrGWPEKywCPzX4RTJugqRh7kJSo5aehsLYPEWkUxBWA39oMrZ7ZxuM4fgyXYs2cPwh5n8aNNpH5x2VyK1

## Create Account User2
    ./iwallet --account admin --amount_limit '*:unlimited' account create user2 --initial_balance 1000 --initial_gas_pledge 1000

## Deploy Contract
    ./iwallet --expiration 100000 --gas_limit 1000000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' publish build/BaseToken.js build/BaseToken.json

## Call Transaction
- User cannot call deploy
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "ContractBAMoAndfhCRxvetdeHyRfaK2tgsR2YhoUXqGWZ47b4wu" "deploy" '["rate3","RTE","18"]'
- Admin calls deploy
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "ContractBAMoAndfhCRxvetdeHyRfaK2tgsR2YhoUXqGWZ47b4wu" "deploy" '["rate3","RTE","18"]'

## Issue Token
- User cannot issue token
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "ContractGPzeYJncTSy1tihV2qUHTYAsnqvoN1vi7CUXFhTvf8Po" "issue" '["admin","100000000000000000000000"]'
- Admin issue token
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "ContractGPzeYJncTSy1tihV2qUHTYAsnqvoN1vi7CUXFhTvf8Po" "issue" '["admin","100000000000000000000000"]'
- Token amount must be INTEGER
- Token amount must be NON-NEGATIVE
- Token amount must be within UINT256
- IOST account must be valid
- IOST account is not blacklisted

## Transfer Tokens
- Can only transfer tokens from own balance
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "ContractGPzeYJncTSy1tihV2qUHTYAsnqvoN1vi7CUXFhTvf8Po" "transfer" '["admin","user","50000000000000000000000",""]'

    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "ContractGPzeYJncTSy1tihV2qUHTYAsnqvoN1vi7CUXFhTvf8Po" "transfer" '["user2","admin","50000000000000000000000",""]'
 - Token amount must be INTEGER
- Token amount must be NON-NEGATIVE
- Token amount must be within UINT256
- IOST account must be valid
- IOST account is not blacklisted

## Burn Tokens
- Token amount must be INTEGER
- Token amount must be NON-NEGATIVE
- Token amount must be within UINT256
- IOST account must be valid
- IOST account is not blacklisted
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "ContractGPzeYJncTSy1tihV2qUHTYAsnqvoN1vi7CUXFhTvf8Po" "burn" '["admin","30000000000000000000000"]'

## Convert Tokens
- Ethreum address must be valid

## Blacklist User
- Admin blacklist user
- IOST account must be valid
- IOST account is not blacklisted