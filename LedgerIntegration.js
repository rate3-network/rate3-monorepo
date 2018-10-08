'use strict';

import Eth from '@ledgerhq/hw-app-eth';
import Transport from '@ledgerhq/hw-transport-node-hid';

// const transport = new Transport();
// const transport = Transport.create();
// const eth = new Eth(transport);
// console.log(transport);

console.log('get Eth address');
const getEthAddress = async () => {
  const transport = await Transport.create();
  const eth = new Eth(transport);
  const result = await eth.getWalletPublicKey("44'/0'/0'/0/0");
  console.log('result');
  return result.bitcoinAddress;
};
getEthAddress().then(a => console.log(a, 'call back'));
console.log('end');
