require('@babel/register');
require('@babel/polyfill');

const HDWalletProvider = require('truffle-hdwallet-provider');
const LedgerWalletProvider = require('truffle-ledger-provider');
const secrets = require('./secrets');

const ledgerOptions = {
  networkId: 1, // mainnet
  path: "44'/60'/0'/0/0", // new ledger default derivation path
  askConfirm: true,
  accountsLength: 1,
  accountsOffset: 0
};

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        mainnet: {
            // provider: () => new HDWalletProvider(secrets.MNEMONIC, 'https://mainnet.infura.io/v3/e49eab7ebf6b47688265ad5e5c0aacd0', 0),
            provider: new LedgerWalletProvider(
                ledgerOptions,
                'https://mainnet.infura.io/v3/e49eab7ebf6b47688265ad5e5c0aacd0',
                true,
            ),
            gas: 6700000,
            gasPrice: 15000000000,
            network_id: 1,
            timeoutBlocks: 100,
            skipDryRun: true,
        },
        development: {
            host: '127.0.0.1',
            port: 8545,
            network_id: '*', // Match any network id
            gasLimit: 5000000,
        },
        ropsten: {
            provider: () => new HDWalletProvider(secrets.MNEMONIC, `https://ropsten.infura.io/v3/3a08337e8be544bcac0fb03456e4b72f`, 0, 10),
            gas: 6700000,
            gasPrice: 3000000000,
            network_id: 3,
            timeoutBlocks: 100,
            skipDryRun: true,
        },
        rinkeby: {
            provider: () => new HDWalletProvider(secrets.MNEMONIC, `https://rinkeby.infura.io/${secrets.INFURA_KEY}`),
            gas: 6700000,
            gasPrice: 3000000000,
            network_id: 4,
            timeoutBlocks: 100,
        },
        kovan: {
            provider: () => new HDWalletProvider(secrets.MNEMONIC, `https://kovan.infura.io/${secrets.INFURA_KEY}`),
            gas: 6700000,
            gasPrice: 3000000000,
            network_id: 42,
            timeoutBlocks: 100,
        },
    },
    compilers: {
        solc: {
          version: "0.4.24",
          settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
            },
        },
    },
};
