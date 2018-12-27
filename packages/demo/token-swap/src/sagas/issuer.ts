import { all, call, put, takeLatest, select } from 'redux-saga/effects';
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

function* approveE2S(tx: IE2SRequest) {
  // yield fetchE2S();
  console.log('approving E2S', tx);
}

function* approveS2E(tx: IS2ERequest) {
  // yield fetchE2S();
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
  unlockTx.send(options)
      .once('transactionHash', (hash) => {
        console.log('hash', hash);
      })
      .once('receipt', async (receipt) => {
        console.log(receipt);
        const ev = receipt.events.ConversionUnlocked;
        const { transactionHash } = receipt.events.ConversionUnlocked;
        // const { ethAddress, indexID } = ev.returnValues;
        // const stellarAddressConverted = hexToEd25519PublicKey(STELLAR_ADDRESS);
        // const conversionAmount = fromTokenAmount(ev.returnValues.amount, 2);
        try {
          await localforage.setItem(
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
      })
      .on('confirmation', (confirmationNo, receipt) => {
        if (confirmationNo >= 5) {
          console.log(confirmationNo, receipt);
          unlockTx.off('confirmation');
        }
      })
      .on('error', (err) => {
        throw err;
      });
  console.log('approving S2E', tx);
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

export default function* network() {
  yield takeLatest(issuerActions.FETCH_ETH_TO_STELLAR, fetchE2S);
  yield takeLatest(issuerActions.FETCH_STELLAR_TO_ETH, fetchS2E);
  yield takeLatest(issuerActions.APPROVE, approve);
  // yield takeLatest(networkActions.INIT_ISSUER, setUp);
}
