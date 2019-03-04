const IOST = require('iost');
const bs58 = require('bs58');
const fs = require('fs');

const NETWORK = 'http://127.0.0.1:30001';
const ADMIN_ACCOUNT = 'admin';
const ADMIN_ACCOUNT_SECRET = '2yquS3ySrGWPEKywCPzX4RTJugqRh7kJSo5aehsLYPEWkUxBWA39oMrZ7ZxuM4fgyXYs2cPwh5n8aNNpH5x2VyK1';

const rpc = new IOST.RPC(new IOST.HTTPProvider(NETWORK));

const admin = new IOST.IOST(
  // Will use default setting if not set.
  {
    gasRatio: 1,
    gasLimit: 2000000,
    delay:0,
    expiration: 90,
    defaultLimit: 'unlimited',
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

// To be filled by transactions below.
let user;
// TODO: Contract deployment have to be done seperately from test, for now.
let CONTRACT_ADDRESS = 'Contracti29Ljp1xVAta8GqSepXvAQ21R246in8B9bJTWcEUUDp';

beforeAll(async (done) => {
  // Buy enough RAM and pledge enough gas for admin account.
  const tx1 = admin.callABI('ram.iost', 'buy', ['admin', 'admin', 100000]);
  admin.currentAccount.signTx(tx1);
  const tx1Handler = new IOST.TxHandler(tx1, rpc);
  tx1Handler
    .onSuccess(() => {
      const tx2 = admin.callABI('gas.iost', 'pledge', ['admin', 'admin', '100000']);
      admin.currentAccount.signTx(tx2);
      const tx2Handler = new IOST.TxHandler(tx2, rpc);
      tx2Handler
        .onSuccess(() => {
          done();
        })
        .onFailed(() => {
          done.fail();
        })
        .send()
        .listen(1000, 90);
    })
    .onFailed(() => {
      done.fail();
    })
    .send()
    .listen(1000, 90);
});

beforeAll(async (done) => {
  // First create KeyPair for new account.
  const newKP = IOST.KeyPair.newKeyPair();
  // Then create new Account transaction.
  const newAccountTx = admin.newAccount(
      'testuser2',
      'admin',
      newKP.id,
      newKP.id,
      1024,
      100
  );
  admin.currentAccount.signTx(newAccountTx);

  const txHandler = new IOST.TxHandler(newAccountTx, admin.currentRPC);
  txHandler
    .onSuccess(() => {
      user = new IOST.IOST(
        // Will use default setting if not set.
        {
          gasRatio: 1,
          gasLimit: 2000000,
          delay:0,
          expiration: 90,
          defaultLimit: 'unlimited',
        },
        new IOST.HTTPProvider(NETWORK)
      );
      user.setRPC(rpc);
      
      const userAccount = new IOST.Account('testuser2');
      userAccount.addKeyPair(
        // Default is Ed25519 algorithm.
        // Base58 decode private key to generate keypair.
        new IOST.KeyPair(bs58.decode(newKP.B58SecKey)),
        'active'
      );
      user.setAccount(userAccount);
      done();
    })
    .onFailed((response) => {
      console.log(response);
      done.fail();
    })
    .send()
    .listen(1000, 90);
});

// test('publish contract', async (done) => {
//   let code = fs.readFileSync(__dirname + '/../build/BaseToken.js').toString();
//   code = code.replace(/\n/g, " ");
//   code = code.replace(/"/g, "\\\"");
//   const abi = JSON.stringify(JSON.parse(fs.readFileSync(__dirname + '/../build/BaseToken.json')));
//   let contract = '{"ID":"","info":' + abi + ',"code":\"' + code + '\"}';

//   const tx = admin.callABI("system.iost", "setCode", [contract]);
//   admin.currentAccount.signTx(tx);

//   const txHandler = new IOST.TxHandler(tx, rpc);
//   txHandler
//     .onSuccess((response) => {
//       console.log("Success... tx, receipt: " + JSON.stringify(response));
//       CONTRACT_ADDRESS = JSON.parse(response.returns[0])[0];
//       console.log("CONTRACT_ADDRESS: " + CONTRACT_ADDRESS);
//       done();
//     })
//     .onFailed((response) => {
//       console.log("Failure... tx, receipt: " + JSON.stringify(response));
//       done.fail();
//     })
//     .send()
//     .listen(1000, 90);
// });

describe('contract deployment', () => {
  test('user cannot do contract deployment', async (done) => {
    const tx = user.callABI(CONTRACT_ADDRESS, 'deploy', ['test stablecoin','TSC','18']);
    user.currentAccount.signTx(tx);

    const txHandler = new IOST.TxHandler(tx, user.currentRPC);
    txHandler
      .onSuccess(() => {
        done.fail();
      })
      .onFailed(async (response) => {
        const { data: deployed } = await user.currentRPC.blockchain.getContractStorage(
          CONTRACT_ADDRESS,
          'deployed',
          true
        );
        expect(deployed).toBe('f');
        done();
      })
      .send()
      .listen(1000, 90);
  });

  it('only admin can do contract deployment', async (done) => {
    const tx = admin.callABI(CONTRACT_ADDRESS, 'deploy', ['test stablecoin','TSC','18']);
    admin.currentAccount.signTx(tx);

    const txHandler = new IOST.TxHandler(tx, admin.currentRPC);
    txHandler
      .onSuccess(async () => {
        const { data: deployed } = await admin.currentRPC.blockchain.getContractStorage(
          CONTRACT_ADDRESS,
          'deployed',
          true
        );
        expect(deployed).toBe('t');
        done();
      })
      .onFailed((response) => {
        done.fail();
      })
      .send()
      .listen(1000, 90);
  });

  it('can only do contract deployment once', async (done) => {
    const tx = admin.callABI(CONTRACT_ADDRESS, 'deploy', ['test stablecoin','TSC','18']);
    admin.currentAccount.signTx(tx);

    const txHandler = new IOST.TxHandler(tx, admin.currentRPC);
    txHandler
      .onSuccess(() => {
        done.fail();
      })
      .onFailed(async (response) => {
        const { data: deployed } = await admin.currentRPC.blockchain.getContractStorage(
          CONTRACT_ADDRESS,
          'deployed',
          true
        );
        expect(deployed).toBe('t');
        done();
      })
      .send()
      .listen(1000, 90);
  });
});

// describe('contract deployment', () => {

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

// it('user cannot issue token', async (done) => {
//   const tx = user.callABI(CONTRACT_ADDRESS, 'issue', ['admin','100000000000000000000000']);
//   user.currentAccount.signTx(tx);

//   const txHandler = new IOST.TxHandler(tx, user.currentRPC);
//   await txHandler
//     .onSuccess((response) => {
//       done.fail();
//     })
//     .onFailed((response) => {
//       console.log(response);
//       done();
//     })
//     .send()
//     .listen(1000, 90);
// });

// it('token issued must be integer', async (done) => {
//   const tx = admin.callABI(CONTRACT_ADDRESS, 'issue', ['admin','103123.3123']);
//   admin.currentAccount.signTx(tx);

//   const txHandler = new IOST.TxHandler(tx, admin.currentRPC);
//   await txHandler
//     .onSuccess(async () => {
//       done.fail();
//     })
//     .onFailed((response) => {
//       console.log(response);
//       done();
//     })
//     .send()
//     .listen(1000, 90);
// });

// it('token issued must be number', async (done) => {
//   const tx = admin.callABI(CONTRACT_ADDRESS, 'issue', ['admin','dasdas3123']);
//   admin.currentAccount.signTx(tx);

//   const txHandler = new IOST.TxHandler(tx, admin.currentRPC);
//   await txHandler
//     .onSuccess(async () => {
//       done.fail();
//     })
//     .onFailed((response) => {
//       console.log(response);
//       done();
//     })
//     .send()
//     .listen(1000, 90);
// });

// it('token issued must be nonnegative', async (done) => {
//   const tx = admin.callABI(CONTRACT_ADDRESS, 'issue', ['admin','-50000']);
//   admin.currentAccount.signTx(tx);

//   const txHandler = new IOST.TxHandler(tx, admin.currentRPC);
//   await txHandler
//     .onSuccess(async () => {
//       done.fail();
//     })
//     .onFailed((response) => {
//       console.log(response);
//       done();
//     })
//     .send()
//     .listen(1000, 90);
// });


