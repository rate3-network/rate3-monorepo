
import Decimal from 'decimal.js-light';

export const toTokenAmount = amount => (
  (new Decimal(amount))
    .times((new Decimal(10)).toPower(18))
    .todp(0, Decimal.ROUND_DOWN)
    .toFixed()
);

export const fromTokenAmount = (amount, dp) => (
  (new Decimal(amount))
    .dividedBy((new Decimal(10)).toPower(18))
    .toFixed(dp, Decimal.ROUND_DOWN)
    .toString()
);
