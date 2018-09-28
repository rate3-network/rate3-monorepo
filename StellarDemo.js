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

async function dSign() {
  const sampleXDR = 'web+stellar:tx?xdr=AAAAABB90WssODNIgi6BHveqzxTRmIpvAFRyVNM+Hm2GVuCcAAAAZABiwhcABDcyAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAQkg8Q0RSZ6rszbhlMk1IzhdDpOiyLHwFxzmVAJ2j/GwAAAAXSHboAAAAAAAAAAABhlbgnAAAAECpFmDzmqsgjhVfZaDCR1T7QYWRwUdB76cEPpqtK3A0sP7oQADsCDtTju0I15yklPKnNXI8l1U2u8xo6Kwx3eQG';
  const signedTx = await account0.delegatedSigning(sampleXDR);
  console.log(signedTx);
  console.log(signedTx.toEnvelope().toXDR('base64'));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on('line', (input) => {
  switch (input) {
    case '1': {
      console.log(`Input：${input} Generate 12 seed phrases`);
      wallet.setSeed();
      wallet.setWallet();
      console.log(wallet.getSeed());
      break;
    }
    case '2': {
      console.log(`Input：${input} Get 2 Accounts`);
      demoGetAccount();
      break;
    }
    case '3': {
      console.log(`Input：${input} Send 100 XLM from account 0 to account 1`);
      send();
      break;
    }
    case '4': {
      console.log(`Input：${input} Get transaction history of account 1`);
      receive();
      break;
    }
    case '5': {
      console.log(`Input：${input} Delegated Signing`);
      dSign();
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
