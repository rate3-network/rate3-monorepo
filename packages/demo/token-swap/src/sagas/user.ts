import { take, call, put, takeLatest, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { userActions } from '../actions/user';
import { networkActions } from '../actions/network';
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
  handleContractCall,
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
  yield put({ type: networkActions.SELECT_TX, payload: convertToEthRes.hash });
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

  const { amount, transaction_hash, created_at } = opDetail.data._embedded.records[0];
  const ethAddress = base64toHEX(txDetail.data.memo).toUpperCase()
    .replace(STELLAR_MEMO_PREPEND, '0x');
  const stellarAddress = STELLAR_USER;
  const updatedRequest = {
    ethAddress,
    stellarAddress,
    amount,
    created_at,
    hash: transaction_hash,
    type: 'S2E',
    approved: false,
  };
  yield put({ type: networkActions.ADD_TO_MAP, payload: updatedRequest });
  try {
    yield localforage.setItem(
      transaction_hash,
      updatedRequest
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
    const txSent = tx.send(options);
    const chan = yield call(
      handleContractCall,
      txSent,
      'REQUEST_E2S',
      {}
    );
    try {
      while (true) {
        const nextAction = yield take(chan);
        yield put(nextAction);
      }
    } finally {
      chan.close();
    }
  } catch (e) {
    throw e;
  }
}

function* onE2sReceipt(action: IAction) {
  console.log('on receipt');
  const STELLAR_ADDRESS = Ed25519PublicKeyToHex(STELLAR_USER);
  const { receipt } = action.payload;

  const ev = receipt.events.ConversionRequested;
  const { transactionHash } = receipt.events.ConversionRequested;
  const { ethAddress, indexID, requestTimestamp } = ev.returnValues;
  const stellarAddressConverted = hexToEd25519PublicKey(STELLAR_ADDRESS);
  const conversionAmount = fromTokenAmount(ev.returnValues.amount, 2);
  const updatedRequest = {
    ethAddress,
    indexID,
    requestTimestamp,
    hash: transactionHash,
    stellarAddress: stellarAddressConverted,
    amount: conversionAmount,
    type: 'E2S',
    approved: false,
  };
  yield put({ type: networkActions.ADD_TO_MAP, payload: updatedRequest });
  try {
    yield localforage.setItem(
      transactionHash,
      updatedRequest
    );
  } catch (err) {
    console.log(err);
  }
}

function* onE2sHash(action: IAction) {
  console.log('on hjash');
  const { hash } = action.payload;
  const updatedRequest = {
    hash,
  };
  yield put({ type: networkActions.SELECT_TX, payload: hash });
  yield put({ type: networkActions.ADD_TO_MAP, payload: updatedRequest });
  try {
    yield localforage.setItem(
      hash,
      updatedRequest
    );
  } catch (err) {
    console.log(err);
  }
}

function* onE2sError(action: IAction) {
  console.log(action);
}

export default function* user() {
  yield takeLatest(userActions.REQUEST_ETH_TO_STELLAR, requestE2S);
  yield takeLatest(userActions.REQUEST_STELLAR_TO_ETH, requestS2E);

  yield takeLatest('REQUEST_E2S_HASH', onE2sHash);
  yield takeLatest('REQUEST_E2S_RECEIPT', onE2sReceipt);
  yield takeLatest('REQUEST_E2S_ERROR', onE2sError);
  // yield takeLatest(networkActions.INIT_ISSUER, setUp);
}
