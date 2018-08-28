import { trusteeAddress, userAddress } from './defaults';

export const mainnet = {
  id: 1,
  endpoint: 'https://mainnet.infura.io',
  faucet: null,
  token: '0x0',
  operations: '0x0',
  etherscan: 'https://etherscan.io/tx/',
};
export const ropsten = {
  id: 3,
  endpoint: 'https://ropsten.infura.io',
  faucet: 'http://faucet.ropsten.be:3001',
  token: '0x0',
  operations: '0x0',
  etherscan: 'https://ropsten.etherscan.io/tx/',
};
export const rinkeby = {
  id: 4,
  endpoint: 'https://rinkeby.infura.io',
  faucet: 'https://faucet.rinkeby.io',
  token: '0x0',
  operations: '0x0',
  etherscan: 'https://rinkeby.etherscan.io/tx/',
};
export const kovan = {
  id: 42,
  endpoint: 'https://kovan.infura.io',
  faucet: 'https://github.com/kovan-testnet/faucet',
  token: '0x0',
  operations: '0x0',
  etherscan: 'https://kovan.etherscan.io/tx/',
};
export const local = {
  id: null,
  endpoint: 'http://localhost:8545',
  faucet: null,
  token: '0x0',
  operations: '0x0',
  etherscan: 'https://etherscan.io/tx/',
};

export const contractAddresses = {
  [mainnet.id]: mainnet,
  [ropsten.id]: ropsten,
  [rinkeby.id]: rinkeby,
  [kovan.id]: kovan,
  local,
};

export const accountAddresses = {
  trustee: trusteeAddress,
  user: userAddress,
};
