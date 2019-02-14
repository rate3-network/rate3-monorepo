const IOST = require('iost');
const bs58 = require('bs58');

// Replace contract address here! Make sure this is a freshly deployed contract.
const CONTRACT_ADDRESS = 'ContractBAMoAndfhCRxvetdeHyRfaK2tgsR2YhoUXqGWZ47b4wu';
const NETWORK = 'http://127.0.0.1:30001';

const ADMIN_ACCOUNT = 'admin';
const ADMIN_ACCOUNT_SECRET = '2yquS3ySrGWPEKywCPzX4RTJugqRh7kJSo5aehsLYPEWkUxBWA39oMrZ7ZxuM4fgyXYs2cPwh5n8aNNpH5x2VyK1';

// Replace with created account secret.
const USER_ACCOUNT = 'user2';
const USER_ACCOUNT_SECRET = '5JyfdnQ7H9xdEeqLM5HzzRYWQxAxgvZ3yQceXjdkcKe8EriRjhkzxdTmfd1zEp2QfdvXzTCMNcf48uKof6259rCE';

const rpc = new IOST.RPC(new IOST.HTTPProvider(NETWORK));

const admin = new IOST.IOST(
  // Will use default setting if not set.
  {
    gasPrice: 100,
    gasLimit: 2000000,
    delay: 0,
  },
  new IOST.HTTPProvider(NETWORK)
);
admin.setRPC(rpc);

const adminAccount = new IOST.Account(ADMIN_ACCOUNT);
adminAccount.addKeyPair(
  // Default is Ed25519 algorithm.
  // Base58 decode private key to generate keypair.
  new IOST.KeyPair(bs58.decode(ADMIN_ACCOUNT_SECRET)),
  'active'
);
admin.setAccount(adminAccount);

const user = new IOST.IOST(
  // Will use default setting if not set.
  {
    gasPrice: 100,
    gasLimit: 2000000,
    delay: 0,
  },
  new IOST.HTTPProvider(NETWORK)
);
user.setRPC(rpc);

const userAccount = new IOST.Account(USER_ACCOUNT);
userAccount.addKeyPair(
  // Default is Ed25519 algorithm.
  // Base58 decode private key to generate keypair.
  new IOST.KeyPair(bs58.decode(USER_ACCOUNT_SECRET)),
  'active'
);
user.setAccount(userAccount);

// it('contract deployment', async (done) => {
//   const tx = admin.callABI(CONTRACT_ADDRESS, 'deploy', ['test stablecoin','TSC','18']);
//   admin.currentAccount.signTx(tx);

//   const txHandler = new IOST.TxHandler(tx, admin.currentRPC);
//   await txHandler
//     .onSuccess(async () => {
//       const { data: deployed } = await admin.currentRPC.blockchain.getContractStorage(
//         CONTRACT_ADDRESS,
//         'deployed',
//         true
//       );
//       expect(deployed).toBe('t');
//       done();
//     })
//     .onFailed(() => {
//       done.fail();
//     })
//     .send()
//     .listen(1000, 90);
// });

// it('admin issue token 1', async (done) => {
//   const tx = admin.callABI(CONTRACT_ADDRESS, 'issue', ['admin','100000000000000000000000']);
//   admin.currentAccount.signTx(tx);

//   const txHandler = new IOST.TxHandler(tx, admin.currentRPC);
//   await txHandler
//     .onSuccess(async () => {
//       const { data: deployed } = await admin.currentRPC.blockchain.getContractStorage(
//         CONTRACT_ADDRESS,
//         'balances',
//         ADMIN_ACCOUNT,
//         true
//       );
//       expect(deployed).toBe('1e+23');
//       done();
//     })
//     .onFailed(() => {
//       done.fail();
//     })
//     .send()
//     .listen(1000, 90);
// });

// it('admin issue token 2', async (done) => {
//   const tx = admin.callABI(CONTRACT_ADDRESS, 'issue', ['admin','100000000000000000000000']);
//   admin.currentAccount.signTx(tx);

//   const txHandler = new IOST.TxHandler(tx, admin.currentRPC);
//   await txHandler
//     .onSuccess(async () => {
//       const { data: deployed } = await admin.currentRPC.blockchain.getContractStorage(
//         CONTRACT_ADDRESS,
//         'balances',
//         ADMIN_ACCOUNT,
//         true
//       );
//       expect(deployed).toBe('2e+23');
//       done();
//     })
//     .onFailed(() => {
//       done.fail();
//     })
//     .send()
//     .listen(1000, 90);
// });

it('user cannot issue token', async (done) => {
  const tx = user.callABI(CONTRACT_ADDRESS, 'issue', ['admin','100000000000000000000000']);
  user.currentAccount.signTx(tx);

  const txHandler = new IOST.TxHandler(tx, user.currentRPC);
  await txHandler
    .onSuccess((response) => {
      done.fail();
    })
    .onFailed((response) => {
      console.log(response);
      done();
    })
    .send()
    .listen(1000, 90);
});

it('token issued must be integer', async (done) => {
  const tx = admin.callABI(CONTRACT_ADDRESS, 'issue', ['admin','103123.3123']);
  admin.currentAccount.signTx(tx);

  const txHandler = new IOST.TxHandler(tx, admin.currentRPC);
  await txHandler
    .onSuccess(async () => {
      done.fail();
    })
    .onFailed((response) => {
      console.log(response);
      done();
    })
    .send()
    .listen(1000, 90);
});

it('token issued must be number', async (done) => {
  const tx = admin.callABI(CONTRACT_ADDRESS, 'issue', ['admin','dasdas3123']);
  admin.currentAccount.signTx(tx);

  const txHandler = new IOST.TxHandler(tx, admin.currentRPC);
  await txHandler
    .onSuccess(async () => {
      done.fail();
    })
    .onFailed((response) => {
      console.log(response);
      done();
    })
    .send()
    .listen(1000, 90);
});

it('token issued must be nonnegative', async (done) => {
  const tx = admin.callABI(CONTRACT_ADDRESS, 'issue', ['admin','-50000']);
  admin.currentAccount.signTx(tx);

  const txHandler = new IOST.TxHandler(tx, admin.currentRPC);
  await txHandler
    .onSuccess(async () => {
      done.fail();
    })
    .onFailed((response) => {
      console.log(response);
      done();
    })
    .send()
    .listen(1000, 90);
});


