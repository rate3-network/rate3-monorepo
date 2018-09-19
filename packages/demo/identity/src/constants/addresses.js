// import { trusteeAddress, userAddress } from './defaults';

export const mainnet = {
  id: 1,
  name: 'Main',
  endpoint: 'https://mainnet.infura.io',
  faucet: null,
  token: '0x0',
  operations: '0x0',
  etherscanTx: 'https://etherscan.io/tx/',
  etherscanAddr: 'https://etherscan.io/address/',
};
export const ropsten = {
  id: 3,
  name: 'Ropsten',
  // endpoint: 'https://ropsten.infura.io',
  endpoint: 'ws://127.0.0.1:8545',
  faucet: 'http://faucet.ropsten.be:3001',
  token: '0x1379d4b96c7a6e33ba6d3e69881849bb4da0ec6a',
  operations: '0x1825576515f60ad4e9177417ad6d2118491f081c',
  etherscanTx: 'https://ropsten.etherscan.io/tx/',
  etherscanAddr: 'https://ropsten.etherscan.io/address/',
};
export const rinkeby = {
  id: 4,
  name: 'Rinkeby',
  endpoint: 'https://rinkeby.infura.io',
  faucet: 'https://faucet.rinkeby.io',
  token: '0x1379d4b96c7a6e33ba6d3e69881849bb4da0ec6a',
  operations: '0x1825576515f60ad4e9177417ad6d2118491f081c',
  etherscanTx: 'https://rinkeby.etherscan.io/tx/',
  etherscanAddr: 'https://rinkeby.etherscan.io/address/',
};
export const kovan = {
  id: 42,
  name: 'Kovan',
  endpoint: 'https://kovan.infura.io',
  faucet: 'https://github.com/kovan-testnet/faucet',
  token: '0x1379d4b96c7a6e33ba6d3e69881849bb4da0ec6a',
  operations: '0x1825576515f60ad4e9177417ad6d2118491f081c',
  etherscanTx: 'https://kovan.etherscan.io/tx/',
  etherscanAddr: 'https://kovan.etherscan.io/address/',
};
export const local = {
  id: null,
  endpoint: 'http://localhost:8545',
  faucet: null,
  token: '0x0',
  operations: '0x0',
};

export const contractAddresses = {
  // [mainnet.id]: mainnet,
  // [ropsten.id]: ropsten,
  // [rinkeby.id]: rinkeby,
  // [kovan.id]: kovan,
  // local,
  Ropsten: ropsten,
  Rinkeby: rinkeby,
  Kovan: kovan,
};

// export const accountAddresses = {
//   trustee: trusteeAddress,
//   user: userAddress,
// };
