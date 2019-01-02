import { all, call, put, takeLatest, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { userActions } from '../actions/user';
import axios from 'axios';
import {
  remove0x,
  base64toHEX,
  IAction,
  Ed25519PublicKeyToHex,
  hexToEd25519PublicKey,
  retryCall,
  toTokenAmount,
  fromTokenAmount,
} from '../utils/general';
import localforage from 'localforage'; // tslint:disable-line:import-name
import {
  ETH_ISSUER,
  ETH_USER,
  localForageConfig,
  STELLAR_DISTRIBUTOR_SECRET,
  STELLAR_DISTRIBUTOR,
  STELLAR_ISSUER_SECRET,
  STELLAR_ISSUER,
  STELLAR_MEMO_PREPEND,
  STELLAR_USER_SECRET,
  STELLAR_USER,
 } from '../constants/defaults';

localforage.config(localForageConfig);
function* mintAssetToDistributor(r3, asset, value: string | number, issuerKeypair) {
  const mintAssetToDistributorTx = yield r3.assetContracts.mintAsset({
    asset,
    amount: value,
    issuingAccountPublicKey: STELLAR_ISSUER,
    distributionAccountPublicKey: STELLAR_DISTRIBUTOR,
  });
  const mintAssetToDistributorTxDetail = mintAssetToDistributorTx.tx;
  mintAssetToDistributorTxDetail.sign(issuerKeypair);

  const resSend = yield r3.stellar.submitTransaction(mintAssetToDistributorTxDetail);
  console.log('able to issue asset to distributor', resSend);
}

function* distributeToUser(r3, asset, value: string | number, distributorKeyPair) {
  const distributeToUserTx = yield r3.assetContracts.distributeAsset({
    asset,
    amount: value,
    distributionAccountPublicKey: STELLAR_DISTRIBUTOR,
    destinationAccountPublicKey: STELLAR_USER,
  });
  const distributeTxDetail = distributeToUserTx.tx;
  distributeTxDetail.sign(distributorKeyPair);

  const distributeRes = yield r3.stellar.submitTransaction(distributeTxDetail);
  console.log('able to distribute asset to user', distributeRes);
}
function* convertToEthereum(r3, asset, value: string | number, userKeypair) {
  const convertToEth = yield r3.assetContracts.convertAssetToEthereumToken({
    asset,
    amount: value,
    issuingAccountPublicKey: STELLAR_ISSUER,
    converterAccountPublicKey: STELLAR_USER,
    ethereumAccountAddress: remove0x(ETH_USER),
  });
  const convertToEthTxDetail = convertToEth.tx;
  convertToEthTxDetail.sign(userKeypair);
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
    .replace(STELLAR_MEMO_PREPEND, '0x');
  const stellarAddress = STELLAR_USER;
  console.log('eth address', ethAddress);
  console.log('amount', opDetail.data._embedded.records[0].amount);
  try {
    yield localforage.setItem(
      transaction_hash,
      { ethAddress, stellarAddress, amount, hash: transaction_hash, type: 'S2E', approved: false }
    );
  } catch (err) {
    console.log(err);
  }
}
function* requestS2E(action: IAction) {
  const value = action.payload;
  try {
    const getR3 = state => state.network.r3;
    const r3 = yield select(getR3);
    const asset = new r3.Stellar.Asset('TestAsset', STELLAR_ISSUER);
    console.log('asset', asset);
    // const issuerKeypair = r3.Stellar.Keypair.fromSecret(STELLAR_ISSUER_SECRET);
    // const distributorKeyPair = r3.Stellar.Keypair.fromSecret(STELLAR_DISTRIBUTOR_SECRET);
    const userKeypair = r3.Stellar.Keypair.fromSecret(STELLAR_USER_SECRET);

    // yield mintAssetToDistributor(r3, asset, value, issuerKeypair);
    // yield distributeToUser(r3, asset, value, distributorKeyPair);
    yield convertToEthereum(r3, asset, value, userKeypair);

  } catch (e) {
    console.error(e);
  }
}

function* requestE2S(action: IAction) {
  const amount = action.payload;
  const getContract = state => state.network.contract;
  const contract = yield select(getContract);
  console.log(contract);
  try {
    const STELLAR_ADDRESS = Ed25519PublicKeyToHex(STELLAR_USER);

    const tx = contract.methods.requestConversion(toTokenAmount(amount), STELLAR_ADDRESS);
    const options = {
      from: ETH_USER,
      gasLimit: '200000',
    };
    tx.send(options)
      .once('transactionHash', (hash) => {
        console.log('hash', hash);
      })
      .once('receipt', async (receipt) => {
        console.log(receipt);
        const ev = receipt.events.ConversionRequested;
        const { transactionHash } = receipt.events.ConversionRequested;
        const { ethAddress, indexID } = ev.returnValues;
        const stellarAddressConverted = hexToEd25519PublicKey(STELLAR_ADDRESS);
        const conversionAmount = fromTokenAmount(ev.returnValues.amount, 2);
        try {
          await localforage.setItem(
            transactionHash,
            { ethAddress,
              indexID,
              hash: transactionHash,
              stellarAddress: stellarAddressConverted,
              amount: conversionAmount,
              type: 'E2S',
              approved: false,
            }
          );
        } catch (err) {
          console.log(err);
        }
      })
      .on('confirmation', (confirmationNo, receipt) => {
        if (confirmationNo >= 5) {
          console.log(confirmationNo, receipt);
          tx.off('confirmation');
        }
      })
      .on('error', (err) => {
        throw err;
      });
  } catch (e) {
    throw e;
  }
}

export default function* user() {
  yield takeLatest(userActions.REQUEST_ETH_TO_STELLAR, requestE2S);
  yield takeLatest(userActions.REQUEST_STELLAR_TO_ETH, requestS2E);
  // yield takeLatest(networkActions.INIT_ISSUER, setUp);
}
