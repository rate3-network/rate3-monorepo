// tslint:disable:object-shorthand-properties-first
// tslint:disable:no-empty

import { take, call, put, takeEvery, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { issuerActions } from '../actions/issuer';
import { IE2SRequest, IS2ERequest } from '../reducers/issuer';
import localforage from 'localforage'; // tslint:disable-line:import-name
import axios from 'axios';
import { networkActions } from '../actions/network';
import {
  IAction,
  Ed25519PublicKeyToHex,
  toTokenAmount,
  handleContractCall,
  retryCall,
} from '../utils/general';
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
  HORIZON,
} from '../constants/defaults';

type TransactionType = IE2SRequest | IS2ERequest;
localforage.config(localForageConfig);


function* fetchE2S() {
  try {
    const resultList: any[] = [];
    // const res = yield axios.get(
    //   `${HORIZON}/accounts/${STELLAR_USER}/payments?limit=10&order=desc`);
    // res.data._embedded.records.forEach((item) => {
    //   resultList.push(item);
    // });
    const result = yield localforage.iterate((value: any, key, iterationNumber) => {
      if (value.type === 'E2S') {
        resultList.push(value);
      }
    });
    yield put({ type: issuerActions.SET_E2S_APPROVAL_LIST, payload: resultList });
    return resultList;
  } catch (err) {
    throw err;
  }
}
function* fetchS2E() {
  try {
    const resultList: any[] = [];
    const result = yield localforage.iterate((value: any, key, iterationNumber) => {
      if (value.type === 'S2E') {
        resultList.push(value);
      }
    });
    // console.log(resultList);
    yield put({ type: issuerActions.SET_S2E_APPROVAL_LIST, payload: resultList });
    return resultList;
  } catch (err) {
    throw err;
  }
}

async function mintAssetToDistributor(r3, asset, value: string | number) {
  const issuerKeypair = r3.Stellar.Keypair.fromSecret(STELLAR_ISSUER_SECRET);
  const mintAssetToDistributorTx = await r3.assetContracts.mintAsset({
    asset,
    amount: value,
    issuingAccountPublicKey: STELLAR_ISSUER,
    distributionAccountPublicKey: STELLAR_DISTRIBUTOR,
  });
  const mintAssetToDistributorTxDetail = mintAssetToDistributorTx.tx;
  mintAssetToDistributorTxDetail.sign(issuerKeypair);

  const resSend = await r3.stellar.submitTransaction(mintAssetToDistributorTxDetail);
  // console.log('able to issue asset to distributor', resSend);
}

function* distributeToUser(r3, asset, value: string | number) {
  const distributorKeyPair = r3.Stellar.Keypair.fromSecret(STELLAR_DISTRIBUTOR_SECRET);
  const distributeToUserTx = yield r3.assetContracts.distributeAsset({
    asset,
    amount: value,
    distributionAccountPublicKey: STELLAR_DISTRIBUTOR,
    destinationAccountPublicKey: STELLAR_USER,
  });
  const distributeTxDetail = distributeToUserTx.tx;
  distributeTxDetail.sign(distributorKeyPair);

  const distributeRes = yield r3.stellar.submitTransaction(distributeTxDetail);
  const link = distributeRes._links.transaction.href;
  let txDetail;
  function* getTxDetail() {
    txDetail = yield axios.get(link);
  }
  yield retryCall(getTxDetail, 300, 5);
  // console.log('able to distribute asset to user', distributeRes, txDetail.data.created_at);
  return {
    created_at: txDetail.data.created_at,
    stellarTokenMintHash: distributeRes.hash,
  };
}

function* approveE2S(tx: IE2SRequest) {
  const getR3 = state => state.network.r3;
  const r3 = yield select(getR3);
  // console.log(r3);

  const { indexID } = tx;
  const getContract = state => state.network.contract;
  const contract = yield select(getContract);
  const acceptTx = contract.methods.acceptConversion(indexID);
  const options = {
    from: ETH_ISSUER,
    gasLimit: '200000',
  };
  const acceptTxSent = contract.methods.acceptConversion(indexID).send(options);
  const chan = yield call(
    handleContractCall,
    acceptTxSent,
    'APPROVE_E2S',
    { tx }
  );
  try {
    while (true) {
      const nextAction = yield take(chan);
      yield put(nextAction);
    }
  } finally {
    chan.close();
  }
}

function* approveS2E(tx: IS2ERequest) {
  const { amount, ethAddress, stellarAddress } = tx;
  const STELLAR_ADDRESS = Ed25519PublicKeyToHex(stellarAddress);
  const getContract = state => state.network.contract;
  const contract = yield select(getContract);
  const unlockTx = contract.methods.unlockConversion(
    toTokenAmount(amount),
    ethAddress,
    STELLAR_ADDRESS
  );
  const options = {
    from: ETH_ISSUER,
    gasLimit: '200000',
  };
  const unlockTxSent = unlockTx.send(options);
  const chan = yield call(
    handleContractCall,
    unlockTxSent,
    'APPROVE_S2E',
    { tx }
  );
  try {
    while (true) {
      const nextAction = yield take(chan);
      yield put(nextAction);
    }
  } finally {
    chan.close();
  }
}

function* approve(action: IAction) {
  const tx: TransactionType = action.payload;
  // console.log('going tru approve');
  if (tx.approved) {
    // console.log('dun mess with me');
    return;
  }
  if (tx.type === 'E2S') {
    yield approveE2S(tx);
  } else {
    yield approveS2E(tx);
  }
}
function* onE2sHash(action: IAction) {
  const { hash, tx } = action.payload;
  // console.log(action);
  const updatedRequest = {
    ...tx,
    inProgress: true,
    aceeptHash: hash,
  };
  yield put({ type: networkActions.ADD_TO_MAP, payload: updatedRequest });
  yield fetchE2S();
  try {
    yield localforage.setItem(
      tx.hash,
      updatedRequest
    );
  } catch (err) {
    // console.log(err);
  }
}
function* onS2eHash(action: IAction) {
  const { hash, tx } = action.payload;
  // console.log(action);
  const updatedRequest = {
    ...tx,
    inProgress: true,
    unlockHash: hash,
    withdrawalHash: hash,
  };
  yield put({ type: networkActions.ADD_TO_MAP, payload: updatedRequest });
  yield fetchS2E();

  try {
    yield localforage.setItem(
      tx.hash,
      updatedRequest
    );
  } catch (err) {
    // console.log(err);
  }
}
function* onE2sReceipt(action: IAction) {
  const getR3 = state => state.network.r3;
  const r3 = yield select(getR3);

  const asset = new r3.Stellar.Asset('TestAsset', STELLAR_ISSUER);
  const { receipt } = action.payload;
  const { tx } = action.payload;
  const { amount } = tx;

  // console.log(receipt);
  const ev = receipt.events.ConversionAccepted;
  const { transactionHash } = ev;
  const { acceptTimestamp } = ev.returnValues;
  const updatedRequest = { ...tx,
    acceptTimestamp,
    aceeptHash: transactionHash,
    acceptedBy: ETH_ISSUER,
  };
  yield put({ type: networkActions.ADD_TO_MAP, payload: updatedRequest });
  try {
    yield localforage.setItem(
      tx.hash,
      updatedRequest
    );
  } catch (err) {
    // console.log(err);
  }

  yield mintAssetToDistributor(r3, asset, amount);
  const finalRes = yield distributeToUser(r3, asset, amount);
  const finishedRequest = {
    ...updatedRequest,
    approved: true,
    stellarTokenMintHash: finalRes.stellarTokenMintHash,
    stellarTokenMintTimestamp: finalRes.created_at,
    withdrawalHash: finalRes.stellarTokenMintHash,
  };
  yield put({ type: networkActions.ADD_TO_MAP, payload: finishedRequest });
  try {
    yield localforage.setItem(
      tx.hash,
      finishedRequest
    );
  } catch (err) {
    // console.log(err);
  }
  yield fetchE2S();
  yield put({ type: issuerActions.FETCH_ETH_TO_STELLAR });

}

function* onE2sError(action: IAction) {
  // console.log(action);
  const { message, tx } = action.payload;
  // console.log(action);
  const updatedRequest = {
    ...tx,
    error: message,
  };
  yield put({ type: networkActions.ADD_TO_MAP, payload: updatedRequest });
}

function* onS2eReceipt(action: IAction) {
  const getR3 = state => state.network.r3;
  const r3 = yield select(getR3);

  const { receipt } = action.payload;
  const { tx } = action.payload;
  let updatedTx;
  try {
    updatedTx = yield localforage.getItem(tx.hash);
  } catch (err) {
    // console.log(err);
  }

  // console.log(receipt);
  const ev = receipt.events.ConversionUnlocked;
  const { transactionHash } = ev;
  const { unlockTimestamp } = ev.returnValues;
  const updatedRequest = {
    ...updatedTx,
    unlockTimestamp,
    approvalHash: transactionHash,
    withdrawalHash: transactionHash,
    approvedBy: ETH_ISSUER,
    approved: true,
  };
  yield put({ type: networkActions.ADD_TO_MAP, payload: updatedRequest });

  try {
    yield localforage.setItem(
      tx.hash,
      updatedRequest
    );
  } catch (err) {
    // console.log(err);
  }
  // yield fetchS2E();
  // yield call(delay, 500);
  yield put({ type: issuerActions.FETCH_STELLAR_TO_ETH });

}
function* onS2eError(action: IAction) {
  // console.log(action);
}
export default function* network() {
  yield takeEvery(issuerActions.FETCH_ETH_TO_STELLAR, fetchE2S);

  yield takeEvery(issuerActions.FETCH_STELLAR_TO_ETH, fetchS2E);
  yield takeEvery(issuerActions.APPROVE, approve);

  yield takeEvery('APPROVE_E2S_HASH', onE2sHash);
  yield takeEvery('APPROVE_E2S_RECEIPT', onE2sReceipt);
  yield takeEvery('APPROVE_E2S_ERROR', onE2sError);

  yield takeEvery('APPROVE_S2E_HASH', onS2eHash);
  yield takeEvery('APPROVE_S2E_RECEIPT', onS2eReceipt);
  yield takeEvery('APPROVE_S2E_ERROR', onS2eError);
  // yield takeEvery(networkActions.INIT_ISSUER, setUp);
}
