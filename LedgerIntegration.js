'use strict';

import Eth from '@ledgerhq/hw-app-eth';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';

/**
 * 
 * @param {string} path - the path that the account will be derived
 * If not specified, will derive the 0th account
 * Ledger path is as follows
 * m / 44' / 60' / 0' / address_index
 * This is not BIP 44, without /change
 * https://ledger.readthedocs.io/en/latest/background/hd_use_cases.html#coin-types
 */
async function getInfos(path = "44'/60'/0'/0") {
  let transport;
  try {
    transport = await TransportNodeHid.create();
    const eth = new Eth(transport);
    eth.getAddress(
      path,
      true,
      true,
    ).then(function(publicKey) {
      console.log(JSON.stringify(publicKey));
    }).catch(function(err) {
      console.log(err);
    });
  } catch (e) {
    console.log(e);
  }
}
getInfos();

console.log('end');
