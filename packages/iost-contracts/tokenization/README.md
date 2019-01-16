## Deploy Contract
    ./iwallet --expiration 10000 --gas_limit 1000000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' publish build/BaseToken.js build/BaseToken.json

## Call Transaction
    ./iwallet --expiration 10000 --gas_limit 1000000 --gas_ratio 1 --server localhost:30002 --account admin --amount_limit '*:unlimited' call "ContractCBvgi1RuCp9XbEu37sMHkbMsD1F5VsuUBvzdUoK33A3P" "deploy" '["rate3","RTE","18","admin"]'

