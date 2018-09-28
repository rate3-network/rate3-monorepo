const readline = require('readline');
const Web3 = require('web3');
const WalletManager = require('./WalletManager');

const web3 = new Web3('https://rinkeby.infura.io/v3/54add33f289d4856968099c7dff630a7');

console.log('Initialize');
console.log('Set the wallet to be on Ethereum Rinbeky');
const wallet = new WalletManager('ethereum');
const seedPhrases = 'cement once add carbon fan awake tree long fresh crew property mobile';

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
  const response = await account0.send(account1.getAddress(), '0.01');
  console.log('Response transactionHash, status and gasUsed', response.transactionHash, response.status, response.gasUsed);
  await account1.send(account0.getAddress(), '0.01');
  console.log('send back');
}

async function receive() {
  const history = await account1.receive();
  console.log(history);
}

async function dSign() {
  const sampleTxHash = '0x4c1341c2f96492a89438e377f2adb8d3756ba71758b37ca1b18a125ff2fdb9ef';
  const signedTx = await account0.delegatedSigning(sampleTxHash);
  console.log(signedTx);
  console.log(web3.eth.accounts.recoverTransaction(signedTx.rawTransaction));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on('line', (input) => {
  switch (input) {
    case '1': {
      console.log(`Input：${input} Generate 12 seed phrases`);
      wallet.setSeed(seedPhrases);
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
      console.log(`Input：${input} Send 0.01 ETH from account 0 to account 1`);
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
