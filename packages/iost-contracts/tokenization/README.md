## Deploy Contract
    ./iwallet --expiration 10000 --gas_limit 1000000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' publish build/BaseToken.js build/BaseToken.json

## Call Transaction
    ./iwallet --expiration 10000 --gas_limit 1000000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract78AoLmhBkF4kLTCknn1U7mpcjgMf5WstrhnFmWud71aY" "deploy" '["rate3","RTE","18","admin"]'

## Issue token
    ./iwallet --expiration 10000 --gas_limit 1000000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract78AoLmhBkF4kLTCknn1U7mpcjgMf5WstrhnFmWud71aY" "issue" '["admin","100000000000000000000000"]'

## Check balance
    ./iwallet --expiration 10000 --gas_limit 1000000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract78AoLmhBkF4kLTCknn1U7mpcjgMf5WstrhnFmWud71aY" "balanceOf" '["admin"]'

    ./iwallet --expiration 10000 --gas_limit 1000000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract78AoLmhBkF4kLTCknn1U7mpcjgMf5WstrhnFmWud71aY" "balanceOf" '["user1"]'

## Transfer tokens
    ./iwallet --expiration 10000 --gas_limit 1000000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "Contract78AoLmhBkF4kLTCknn1U7mpcjgMf5WstrhnFmWud71aY" "transfer" '["admin","user1","50000000000000000000000",""]'

    ./iwallet --expiration 10000 --gas_limit 1000000 --gas_ratio 1 --server localhost:30002 --account user1 --amount_limit '*:unlimited' call "Contract78AoLmhBkF4kLTCknn1U7mpcjgMf5WstrhnFmWud71aY" "transfer" '["user1","admin","50000000000000000000000",""]'