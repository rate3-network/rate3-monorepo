// tslint:disable:object-shorthand-properties-first
// tslint:disable:no-empty

import { all, take, call, put, takeLatest, select } from 'redux-saga/effects';
import { issuerActions } from '../actions/issuer';
import { IE2SRequest, IS2ERequest } from '../reducers/issuer';
import localforage from 'localforage'; // tslint:disable-line:import-name
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
import { eventChannel, END } from 'redux-saga';

function handleContractCall(transaction, type, data) {
  return eventChannel((emitter) => {
    transaction
      .once('error', (error) => {
        emitter({
          type: `${type}_ERROR`,
          payload: {
            message: error.message,
            ...data,
          },
        });
        emitter(END);
      })
      .once('transactionHash', (hash) => {
        emitter({ type: `${type}_HASH`, payload: { hash, ...data } });
      })
      .once('receipt', (receipt) => {
        emitter({ type: `${type}_RECEIPT`, payload: { receipt, ...data } });
      })
      .on('confirmation', (num, receipt) => {
        if (num >= 2) {
          emitter({
            type: `${type}_CONFIRMATION`,
            payload: {
              receipt,
              num,
              ...data,
            },
          });
          emitter({
            type: 'networkActions.NEW_BLOCK',
            toBlock: receipt.blockNumber,
          });
          emitter(END);
        }
      })
      .then((receipt) => {
        emitter({ type: `${type}_SUCCESS`, payload: { receipt, ...data }, });
      })
      .catch((err) => {
        emitter({
          type: `${type}_ERROR`,
          payload: {
            message: err.message,
            ...data,
          },
        });
        emitter(END);
      });

    return () => {};
  });
}
type TransactionType = IE2SRequest | IS2ERequest;
localforage.config(localForageConfig);
function* fetchE2S() {
  try {
    const resultList: any[] = [];
    const result = yield localforage.iterate((value: any, key, iterationNumber) => {
      if (value.type === 'E2S') {
        resultList.push(value);
      }
    });
    console.log(resultList);
    yield put({ type: issuerActions.SET_E2S_APPROVAL_LIST, payload: resultList });
    return resultList;
  } catch (err) {
    throw err;
  }
}
function* fetchS2E() {
  console.log(123);
  try {
    const resultList: any[] = [];
    const result = yield localforage.iterate((value: any, key, iterationNumber) => {
      if (value.type === 'S2E') {
        resultList.push(value);
      }
    });
    console.log(resultList);
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
  console.log('able to issue asset to distributor', resSend);
}

async function distributeToUser(r3, asset, value: string | number) {
  const distributorKeyPair = r3.Stellar.Keypair.fromSecret(STELLAR_DISTRIBUTOR_SECRET);
  const distributeToUserTx = await r3.assetContracts.distributeAsset({
    asset,
    amount: value,
    distributionAccountPublicKey: STELLAR_DISTRIBUTOR,
    destinationAccountPublicKey: STELLAR_USER,
  });
  const distributeTxDetail = distributeToUserTx.tx;
  distributeTxDetail.sign(distributorKeyPair);

  const distributeRes = await r3.stellar.submitTransaction(distributeTxDetail);
  console.log('able to distribute asset to user', distributeRes);
}

function* approveE2S(tx: IE2SRequest) {
  const getR3 = state => state.network.r3;
  const r3 = yield select(getR3);
  console.log(r3);
  const asset = new r3.Stellar.Asset('TestAsset', STELLAR_ISSUER);
  const issuerKeypair = r3.Stellar.Keypair.fromSecret(STELLAR_ISSUER_SECRET);
  const distributorKeyPair = r3.Stellar.Keypair.fromSecret(STELLAR_DISTRIBUTOR_SECRET);
  const userKeypair = r3.Stellar.Keypair.fromSecret(STELLAR_USER_SECRET);
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
  if (tx.approved) {
    console.log('dun mess with me');
    return;
  }
  if (tx.type === 'E2S') {
    yield approveE2S(tx);
  } else {
    yield approveS2E(tx);
  }
}
function* print(action: IAction) {
  console.log(action);
}
function* onE2sReceipt(action: IAction) {
  const getR3 = state => state.network.r3;
  const r3 = yield select(getR3);

  const asset = new r3.Stellar.Asset('TestAsset', STELLAR_ISSUER);
  const { receipt } = action.payload;
  const { tx } = action.payload;
  const { amount } = tx;

  console.log(receipt);
  const ev = receipt.events.ConversionAccepted;
  const { transactionHash } = receipt.events.ConversionAccepted;
  try {
    yield localforage.setItem(
      tx.hash,
      { ...tx,
        aceeptHash: transactionHash,
        acceptedBy: ETH_ISSUER,
        acceptTimestamp: 'todo',
      }
    );
  } catch (err) {
    console.log(err);
  }

  yield mintAssetToDistributor(r3, asset, amount);
  yield distributeToUser(r3, asset, amount);
  try {
    yield localforage.setItem(
      tx.hash,
      { ...tx,
        approved: true,
        stellarTokenMintTimestamp: 'todo',
      }
    );
  } catch (err) {
    console.log(err);
  }
}

function* onE2sError(action: IAction) {
  console.log(action);
}

function* onS2eReceipt(action: IAction) {
  const getR3 = state => state.network.r3;
  const r3 = yield select(getR3);

  const asset = new r3.Stellar.Asset('TestAsset', STELLAR_ISSUER);
  const { receipt } = action.payload;
  const { tx } = action.payload;
  const { amount } = tx;

  console.log(receipt);
  const ev = receipt.events.ConversionUnlocked;
  const { transactionHash } = receipt.events.ConversionUnlocked;

  try {
    yield localforage.setItem(
      tx.hash,
      { ...tx,
        approvalHash: transactionHash,
        approvedBy: ETH_ISSUER,
        approveTimestamp: 'todo',
        approved: true,
      }
    );
  } catch (err) {
    console.log(err);
  }
}
function* onS2eError(action: IAction) {
  console.log(action);
}
export default function* network() {
  yield takeLatest(issuerActions.FETCH_ETH_TO_STELLAR, fetchE2S);
  yield takeLatest(issuerActions.FETCH_STELLAR_TO_ETH, fetchS2E);
  yield takeLatest(issuerActions.APPROVE, approve);

  yield takeLatest('APPROVE_E2S_HASH', print);
  yield takeLatest('APPROVE_E2S_RECEIPT', onE2sReceipt);
  yield takeLatest('APPROVE_E2S_ERROR', onE2sError);

  yield takeLatest('APPROVE_S2E_HASH', print);
  yield takeLatest('APPROVE_S2E_RECEIPT', onS2eReceipt);
  yield takeLatest('APPROVE_S2E_ERROR', onS2eError);
  // yield takeLatest(networkActions.INIT_ISSUER, setUp);
}
