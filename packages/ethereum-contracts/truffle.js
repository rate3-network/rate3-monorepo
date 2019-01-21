require('@babel/register');
require('@babel/polyfill');

const HDWalletProvider = require('truffle-hdwallet-provider');
const secrets = require('./secrets');

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        development: {
            host: '127.0.0.1',
            port: 8545,
            network_id: '*', // Match any network id
            gasLimit: 5000000,
        },
        ropsten: {
            provider: () => new HDWalletProvider(secrets.MNEMONIC, `https://ropsten.infura.io/${secrets.INFURA_KEY}`),
            gas: 6700000,
            gasPrice: 3000000000,
            network_id: 3,
            timeoutBlocks: 100,
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
