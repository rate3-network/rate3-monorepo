const HOST = process.env.HOST || 'localhost';

export default [
  {
    name: 'Localhost',
    endpoints: [`http://${HOST}:8545`, `ws://${HOST}:8545`],
  },
  {
    name: 'Ropsten',
    endpoints: ['https://ropsten.infura.io', 'wss://ropsten.infura.io/ws'],
  },
  {
    name: 'Rinkeby',
    endpoints: ['https://rinkeby.infura.io', 'wss://rinkeby.infura.io/ws'],
  },
  {
    name: 'Mainnet',
    endpoints: ['https://mainnet.infura.io', 'wss://mainnet.infura.io/ws'],
  },
  {
    name: 'Kovan',
    endpoints: ['https://kovan.infura.io'],
  },
];
