## Create Account
    ./iwallet --account admin --amount_limit '*:unlimited' account --create user2 --initial_balance 1000 --initial_gas_pledge 100

## Deploy Contract
    ./iwallet --expiration 10000 --gas_limit 1000000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' publish build/BaseToken.js build/BaseToken.json

## Call Transaction
    ./iwallet --expiration 10000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract4oAbEGrKAXZD42TnzNqAre8Mfu8wjkEh4mpsMas3Noo8" "deploy" '["rate3","RTE","18"]'

## Issue token
    ./iwallet --expiration 10000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract4oAbEGrKAXZD42TnzNqAre8Mfu8wjkEh4mpsMas3Noo8" "issue" '["admin","100000000000000000000000"]'

## Check balance
    ./iwallet --expiration 10000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract4oAbEGrKAXZD42TnzNqAre8Mfu8wjkEh4mpsMas3Noo8" "balanceOf" '["admin"]'

    ./iwallet --expiration 10000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract4oAbEGrKAXZD42TnzNqAre8Mfu8wjkEh4mpsMas3Noo8" "balanceOf" '["user2"]'

## Transfer tokens
    ./iwallet --expiration 10000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract4oAbEGrKAXZD42TnzNqAre8Mfu8wjkEh4mpsMas3Noo8" "transfer" '["admin","user2","50000000000000000000000",""]'

    ./iwallet --expiration 10000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract4oAbEGrKAXZD42TnzNqAre8Mfu8wjkEh4mpsMas3Noo8" "transfer" '["user2","admin","50000000000000000000000",""]'

## Burn tokens
    ./iwallet --expiration 10000 --gas_limit 100000 --gas_ratio 1 --server localhost:30002 --account user2 --amount_limit '*:unlimited' call "Contract4oAbEGrKAXZD42TnzNqAre8Mfu8wjkEh4mpsMas3Noo8" "burn" '["admin","30000000000000000000000"]'