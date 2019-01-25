// tslint:disable:import-name
// tslint:disable:no-empty

interface IKeyMirror {
  [key: string]: string;
}
export const keyMirror = (obj: object, namespace: string): IKeyMirror => {
  const res = {};
  for (const type in obj) {
    if (namespace) { // tslint:disable-line:prefer-conditional-expression
      res[type] = `${namespace}:${type}`;
    } else {
      res[type] = type;
    }
  }

  Object.freeze(res);
  return res;
};
export interface IAction<Payload = any, Meta = any> {
  type: string;
  payload?: Payload;
  meta?: Meta;
}
export const createAction = <Payload, Meta>(type: string) =>
  (payload?: Payload, meta?: Meta): IAction<Payload, Meta> =>
    ({ type, payload, meta });

// ================================================================================================
export const truncateAddress = (addr: string, maxLength: number = 12) => {
  const { length } = addr;
  if (length <= maxLength) {
    return addr;
  }
  const half = maxLength / 2;
  return `${addr.substring(0, half)}...${addr.substring(length - half - 1, length)}`;
};
export const toEth = (web3Instance, input, dp = 2) => {
  if (isNaN(parseFloat(input))) {
    return input;
  }
  const converted = web3Instance.utils.fromWei(input);
  const parsed = parseFloat(converted.toString());
  return parsed.toFixed(dp);
};

// ================================================================================================
import { StrKey } from 'stellar-base';

export const base64toHEX = (base64) => {

  const raw = atob(base64);

  let HEX = '';

  for (let i = 0; i < raw.length; i += 1) {
    const _hex = raw.charCodeAt(i).toString(16);
    HEX += (_hex.length === 2 ? _hex : `0${_hex}`);
  }
  return HEX.toUpperCase();
};

export const hexToArrayBuffer = (input) => {
  return new Uint8Array(input.match(/[\da-f]{2}/gi).map((h) => {
    return parseInt(h, 16);
  }));
};

export const hexToEd25519PublicKey = (input) => {
  return StrKey.encodeEd25519PublicKey(hexToArrayBuffer(input));
};

export const Ed25519PublicKeyToHex = (input) => {
  return `0x${StrKey.decodeEd25519PublicKey(input).toString('hex')}`;
};
// ================================================================================================
import { delay, eventChannel, END } from 'redux-saga';

export function* retryCall(action, delayTime = 300, maxRetry = 5) {
  for (let i = 0; i < maxRetry; i += 1) {
    try {
      const order = yield action();
      return order;
    } catch (err) {
      if (i < maxRetry - 1) {
        yield delay(delayTime);
      }
    }
  }
  throw new Error('Max retries reached');
}
export const fromTokenAmount = (amount, dp = 4) => {
  if (amount === 'loading...') return amount;
  return (
    (new Decimal(amount))
      .dividedBy((new Decimal(10)).toPower(18))
      .toFixed(dp, Decimal.ROUND_DOWN)
      .toString()
  );
};

// import { eventChannel, END } from 'redux-saga';
export function handleContractCall(transaction, type, data) {
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

export const remove0x = (addr) => {
  return addr.replace(/0x|0X/, '');
};

// ================================================================================================
import Decimal from 'decimal.js-light';

export const toTokenAmount = amount => (
  (new Decimal(amount))
    .times((new Decimal(10)).toPower(18))
    .todp(0, Decimal.ROUND_DOWN)
    .toFixed()
);

export enum Direction {
  E2S, // eth to stellar
  S2E, // stellar to eth
}

export const copyToClipboard = (val: string) => {
  const selBox = window.document.createElement('textarea');
  selBox.style.position = 'fixed';
  selBox.style.left = '0';
  selBox.style.top = '0';
  selBox.style.opacity = '0';
  selBox.value = val;
  window.document.body.appendChild(selBox);
  selBox.focus();
  selBox.select();
  window.document.execCommand('copy');
  window.document.body.removeChild(selBox);
};

export const calStellarTodaySwapNo = (arr) => {
  const today = new Date();
  const filtered = arr.filter((item) => {
    const thatDay = new Date(item.created_at);
    return (
      thatDay.getFullYear() === today.getFullYear() &&
      thatDay.getMonth() === today.getMonth() &&
      thatDay.getDate() === today.getDate()
    );
  });
  return filtered.length;
};
export const calEthTodaySwapNo = (arr) => {
  const today = new Date();
  const filtered = arr.filter((item) => {
    const thatDay = new Date(parseInt(item.unlockTimestamp, 10) * 1000);
    return (
      thatDay.getFullYear() === today.getFullYear() &&
      thatDay.getMonth() === today.getMonth() &&
      thatDay.getDate() === today.getDate()
    );
  });
  return filtered.length;
};
