## Import initial admin
    ./iwallet account --import admin 2yquS3ySrGWPEKywCPzX4RTJugqRh7kJSo5aehsLYPEWkUxBWA39oMrZ7ZxuM4fgyXYs2cPwh5n8aNNpH5x2VyK1

## Create Account
    ./iwallet --account admin --amount_limit '*:unlimited' account --create user2 --initial_balance 1000 --initial_gas_pledge 100

## Deploy Contract
    ./iwallet --expiration 50000 --gas_limit 1000000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' publish build/BaseToken.js build/BaseToken.json

## Call Transaction
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "ContractGPzeYJncTSy1tihV2qUHTYAsnqvoN1vi7CUXFhTvf8Po" "deploy" '["rate3","RTE","18"]'

## Issue token
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "ContractGPzeYJncTSy1tihV2qUHTYAsnqvoN1vi7CUXFhTvf8Po" "issue" '["admin","100000000000000000000000"]'

## Check balance
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "ContractGPzeYJncTSy1tihV2qUHTYAsnqvoN1vi7CUXFhTvf8Po" "balanceOf" '["admin"]'

    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "ContractGPzeYJncTSy1tihV2qUHTYAsnqvoN1vi7CUXFhTvf8Po" "balanceOf" '["user2"]'

## Transfer tokens
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "ContractGPzeYJncTSy1tihV2qUHTYAsnqvoN1vi7CUXFhTvf8Po" "transfer" '["admin","user","50000000000000000000000",""]'

    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "ContractGPzeYJncTSy1tihV2qUHTYAsnqvoN1vi7CUXFhTvf8Po" "transfer" '["user2","admin","50000000000000000000000",""]'

## Burn tokens
    ./iwallet --expiration 50000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "ContractGPzeYJncTSy1tihV2qUHTYAsnqvoN1vi7CUXFhTvf8Po" "burn" '["admin","30000000000000000000000"]'