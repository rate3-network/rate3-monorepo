const readline = require('readline');
const WalletManager = require('./WalletManager');

console.log('Initialize');
console.log('Set the wallet to be on Stellar testnet');
const wallet = new WalletManager('stellar');

let account0 = null;
let account1 = null;
async function demoGetAccount() {
  account0 = await wallet.getAccount();
  console.log('Account 0', account0.getAddress(), account0.getPrivateKey(), account0.getBalance());
  account1 = await wallet.getAccount(1);
  console.log('Account 1', account1.getAddress(), account1.getPrivateKey(), account1.getBalance());
}

async function send() {
  // console.log(account0, account1);
  const response = await account0.send(account1.getAddress(), '100');
  console.log('Response hash and xdr', response.hash, response.envelope_xdr);
}

async function receive() {
  const history = await account1.receive();
  console.log(history);
}


// const password = 'qwerty';
// function demoEncryptSeedPhrases(pw) {
//   const encrypted = wallet.encryptSeed(pw);
//   console.log(encrypted);
//   const decrypted = wallet.decryptSeed(pw, encrypted);
//   console.log(decrypted);
// }
// demoEncryptSeedPhrases(password);
// demoGetAccount();


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on('line', (input) => {
  switch (input) {
    case '1': {
      console.log(`Input：${input}`);
      wallet.setSeed();
      wallet.setWallet();
      console.log('Generate 12 seed phrases:\n', wallet.getSeed());
      break;
    }
    case '2': {
      console.log(`Input：${input}`);
      demoGetAccount();
      break;
    }
    case '3': {
      console.log(`Input：${input}`);
      send();
      break;
    }
    case '4': {
      console.log(`Input：${input}`);
      receive();
      break;
    }
    default:
      console.log('Exit the program');
      rl.close();
  }
});

// rl.question('你认为 Node.js 中文网怎么样？', (answer) => {
//   // 对答案进行处理
//   console.log(`多谢你的反馈：${answer}`);

//   rl.close();
// });
