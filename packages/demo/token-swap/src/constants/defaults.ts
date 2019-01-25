export const USER_ETH_PRIV = '0x1e572c9b74cdc1669d079823e0725c9599329c7e2f344c4fe3b45de1a1f4e989';
export const ISSUER_ETH_PRIV = '0xa4a55b49cb1235c35ba0c41fe75e0dfcc477bb2f404d7b2751832e6204ccb5d8';

export const HORIZON = 'https://horizon-testnet.stellar.org';

export const STELLAR_USER = 'GAOBZE4CZZOQEB6A43R4L36ESZXCAGDVU7V5ECM5LE4KTLDZ6A4S6CTY';
export const STELLAR_USER_SECRET = 'SA5WYQ7EJNPCX5GQHZHGNHE5XZLT42SL6LAEMIVO6WKC6ZR4YENAEZQV';

export const STELLAR_ISSUER = 'GAC73JYYYVPAPVCEXDOH7Y2KFT6GUSJWJKKCZM52UMIXTZG2T6D5NRRV';
export const STELLAR_ISSUER_SECRET = 'SA6RJV2U5GUK3VYM5CHGATLXEJIDZ37YRF5MJDD5CGKT4LWKMGDDSOOM';

export const STELLAR_DISTRIBUTOR = 'GA3V7T4P6KQJEPEZTVRUJWLZ3XB262BIWXYDZJ4SIS6AOPCX4KNIGGDH';
export const STELLAR_DISTRIBUTOR_SECRET =
  'SD676EDAREHFTLX4MYZCPPZDMV5D44PLP42ORGBHOD5PV5ONXPTIOTLK';

export const ETH_ISSUER = '0xE4Bfd8b40e78e539eb59719Ad695D0D0132FA502';
export const ETH_USER = '0xC819277Bd0198753949c0b946da5d8a0cAfd1cB8';

export const STELLAR_MEMO_PREPEND = '00000000006500740068003A';

export const CONVERSION_CONTRACT_ADDR = '0xdfb3310f8b0445729ddfce660c0d714eeef73c9b';
export const TOKEN_CONTRACT_ADDR = '0x01b488e4035e6c6462b7e258f66fa0b1f2ce09db';

import localforage from 'localforage'; // tslint:disable-line:import-name

export const localForageConfig = {
  driver      : localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
  name        : 'token-swap-demo',
  version     : 1.0,
  size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
  description : 'stores the approval list',
};

export const ONBOARDING_TEXTS = [
  {
    title: 'Cross Chain Demo',
    text: 'These swaps involves only you and someone on the other blockchain looking to swap',
  },
  {
    title: 'There are two ways to swap tokens between blockchains',
    text: '',
  },
  {
    title: '1) Peer-to-Peer Swaps',
    text: 'These swaps involves only you and someone on the other blockchain looking to swap',
  },
  {
    title: '1) Peer-to-Peer Swaps',
    text: `They are based on hashed timelock smart contracts so you can be sure each swap is
      completely safe`,
  },
  {
    title: '2) Direct Swaps',
    text: `On the other hand, direct swaps involves a trusted issuer`,
  },
  {
    title: '2) Direct Swaps',
    text: `They will need to be approved and finalized before the tokens are issued
      on the other blockchain`,
  },
];

export const STEEXP = 'https://testnet.steexp.com';
export const ETHERSCAN = 'https://ropsten.etherscan.io';

// export const INFURA = 'https://ropsten.infura.io';
export const INFURA = 'https://ropsten.infura.io/v3/81cc2101ca344ef8a8fe5742a70249f0';
