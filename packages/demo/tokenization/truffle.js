/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

/* eslint-disable import/no-extraneous-dependencies */
require('babel-register');
require('babel-polyfill');
require('dotenv').config();

const HDWalletProvider = require('truffle-hdwallet-provider');

const mnemonic = process.env.MNEMONIC; // 12 word mnemonic
const infuraKey = process.env.INFURA_KEY;
const ropstenProvider = new HDWalletProvider(
  mnemonic,
  `https://ropsten.infura.io/v3/${infuraKey}`,
  0,
);
const rinkebyProvider = new HDWalletProvider(
  mnemonic,
  `https://rinkeby.infura.io/v3/${infuraKey}`,
  0,
);
const kovanProvider = new HDWalletProvider(
  mnemonic,
  `https://kovan.infura.io/v3/${infuraKey}`,
  0,
);
/* eslint-enable import/no-extraneous-dependencies */

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
    },
    ropsten: {
      provider: () => ropstenProvider,
      network_id: '3',
      gas: 4700000,
    },
    rinkeby: {
      provider: () => rinkebyProvider,
      network_id: '4',
      gas: 7000000,
    },
    kovan: {
      provider: () => kovanProvider,
      network_id: '42',
      gas: 7000000,
    },
  },
};
