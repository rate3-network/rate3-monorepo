import { all, call, put, takeLatest, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { userActions } from '../actions/user';
import axios from 'axios';
import extrapolateFromXdr from '../utils/extrapolateFromXdr';
import { base64toHEX, IAction, hexToArrayBuffer, retryCall } from '../utils/general';
import localforage from 'localforage'; // tslint:disable-line:import-name
import { StrKey } from 'stellar-base';

const HORIZON = 'https://horizon-testnet.stellar.org';

const STELLAR_USER = 'GAOBZE4CZZOQEB6A43R4L36ESZXCAGDVU7V5ECM5LE4KTLDZ6A4S6CTY';
const STELLAR_USER_SECRET = 'SA5WYQ7EJNPCX5GQHZHGNHE5XZLT42SL6LAEMIVO6WKC6ZR4YENAEZQV';

const STELLAR_ISSUER = 'GAC73JYYYVPAPVCEXDOH7Y2KFT6GUSJWJKKCZM52UMIXTZG2T6D5NRRV';
const STELLAR_ISSUER_SECRET = 'SA6RJV2U5GUK3VYM5CHGATLXEJIDZ37YRF5MJDD5CGKT4LWKMGDDSOOM';

const STELLAR_DISTRIBUTOR = 'GA3V7T4P6KQJEPEZTVRUJWLZ3XB262BIWXYDZJ4SIS6AOPCX4KNIGGDH';
const STELLAR_DISTRIBUTOR_SECRET = 'SD676EDAREHFTLX4MYZCPPZDMV5D44PLP42ORGBHOD5PV5ONXPTIOTLK';

const ETH_USER = '0xE4Bfd8b40e78e539eb59719Ad695D0D0132FA502';
localforage.config({
  driver      : localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
  name        : 'token-swap-demo',
  version     : 1.0,
  size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
  description : 'stores the approval list',
});
function* mintAssetToDistributor(r3, asset, value, issuerKeypair) {
  // mint asset to distributor.
  const mintAssetToDistributorTx = yield r3.assetContracts.mintAsset({
    asset,
    amount: value,
    issuingAccountPublicKey: STELLAR_ISSUER,
    distributionAccountPublicKey: STELLAR_DISTRIBUTOR,
  });
  const mintAssetToDistributorTxDetail = mintAssetToDistributorTx.tx;
  // Sign transaction with issuer.
  mintAssetToDistributorTxDetail.sign(issuerKeypair);

  const resSend = yield r3.stellar.submitTransaction(mintAssetToDistributorTxDetail);
  console.log('able to issue asset to distributor', resSend);
}

function* distributeToUser(r3, asset, value, distributorKeyPair) {
  // Distribute asset to user.
  const distributeToUserTx = yield r3.assetContracts.distributeAsset({
    asset,
    amount: value,
    distributionAccountPublicKey: STELLAR_DISTRIBUTOR,
    destinationAccountPublicKey: STELLAR_USER,
  });
  const distributeTxDetail = distributeToUserTx.tx;

  // Sign transaction with distributor.
  distributeTxDetail.sign(distributorKeyPair);

  const distributeRes = yield r3.stellar.submitTransaction(distributeTxDetail);
  console.log('able to distribute asset to user', distributeRes);
}
function* convertToEthereum(r3, asset, value, userKeypair) {
  // Convert asset to ethereum from user.
  const convertToEth = yield r3.assetContracts.convertAssetToEthereumToken({
    asset,
    amount: value,
    issuingAccountPublicKey: STELLAR_ISSUER,
    converterAccountPublicKey: STELLAR_USER,
    ethereumAccountAddress: 'C819277Bd0198753949c0b946da5d8a0cAfd1cB8',
  });
  const convertToEthTxDetail = convertToEth.tx;
  convertToEthTxDetail.sign(userKeypair);
  console.log('line 152');
  const convertToEthRes = yield r3.stellar.submitTransaction(convertToEthTxDetail);
  console.log('able to convert asset to ethereum token from user', convertToEthRes);

  let txDetail;
  function* getTxDetail() {
    txDetail = yield axios.get(convertToEthRes._links.transaction.href);
  }
  yield retryCall(getTxDetail, 300, 5);

  let opDetail;
  function* getTxOperations() {
    opDetail = yield axios.get(`${convertToEthRes._links.transaction.href}/operations`);
  }
  yield retryCall(getTxOperations, 300, 5);

  const { amount, transaction_hash } = opDetail.data._embedded.records[0];
  const ethAddress = base64toHEX(txDetail.data.memo).toUpperCase()
    .replace('00000000006500740068003A', '0x');

  console.log('eth address', ethAddress);
  console.log('amount', opDetail.data._embedded.records[0].amount);
  try {
    yield localforage.setItem(transaction_hash, { ethAddress, amount, approved: false });
  } catch (err) {
    console.log(err);
  }
}
function* requestS2E(action: IAction) {
  const value = action.payload;
  try {
    // test asset send flow
    const getR3 = state => state.network.r3;
    const r3 = yield select(getR3);
    const asset = new r3.Stellar.Asset('TestAsset', STELLAR_ISSUER);
    console.log('asset', asset);
    const issuerKeypair = r3.Stellar.Keypair.fromSecret(STELLAR_ISSUER_SECRET);
    const distributorKeyPair = r3.Stellar.Keypair.fromSecret(STELLAR_DISTRIBUTOR_SECRET);
    const userKeypair = r3.Stellar.Keypair.fromSecret(STELLAR_USER_SECRET);

    yield mintAssetToDistributor(r3, asset, value, issuerKeypair);
    yield distributeToUser(r3, asset, value, distributorKeyPair);
    yield convertToEthereum(r3, asset, value, userKeypair);

  } catch (e) {
    console.error(e);
  }
}

function* requestE2S(action: IAction) {
  const amount = action.payload;
  const getWeb3 = state => state.network.web3Obj;
  const web3Obj = yield select(getWeb3);
  const getContract = state => state.network.contract;
  const contract = yield select(getContract);
  console.log(contract);
  try {
    const STELLAR_ADDRESS = `0x${StrKey.decodeEd25519PublicKey(STELLAR_USER).toString('hex')}`;
    const typedArray = hexToArrayBuffer(STELLAR_ADDRESS);
    console.log(StrKey.encodeEd25519PublicKey(typedArray));
    // const STELLAR_ADDRESS = web3Obj.utils.fromUtf8(STELLAR_USER);
    const tx = contract.methods.requestConversion(amount, STELLAR_ADDRESS);
    const options = {
      from: ETH_USER,
      gasLimit: '200000',
    };
    tx.send(options)
      .once('transactionHash', (hash) => {
        console.log('hash', hash);
      })
      .once('receipt', (receipt) => {
        console.log(receipt);
      })
      .on('confirmation', (confirmationNo, receipt) => {
        if (confirmationNo >= 5) {
          console.log(confirmationNo, receipt);
          tx.off('confirmation');
        }
      })
      .on('error', (err) => {
        console.log(err);
      });
  } catch (e) {
    throw e;
  }
}

export default function* network() {
  yield takeLatest(userActions.REQUEST_ETH_TO_STELLAR, requestE2S);
  yield takeLatest(userActions.REQUEST_STELLAR_TO_ETH, requestS2E);
  // yield takeLatest(networkActions.INIT_ISSUER, setUp);
}
