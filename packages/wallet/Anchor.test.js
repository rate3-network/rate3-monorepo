/**
 * Phase 3 Anchor Bridge, test on client side.
 * Test data are (and only) from SEP-0006,
 * which covers successful cases.
 */
const nock = require('nock');
const Anchor = require('./Anchor');

const anchor = new Anchor('stellar');
const mockURL = 'http://api.example.com';

beforeAll(async () => {
  // Jest will wait for this promise to resolve before running tests.
});

/**
 * sample request
 * GET https://api.example.com/deposit?asset_code=ETH&account=GACW7NONV43MZIFHCOKCQJAKSJSISSICFVUJ2C6EZIW5773OU3HD64VI
 * sample response
 * {
 * "how" : "1Nh7uHdvY6fNwtQtM1G5EZAFPLC33B59rB",
 * "fee_fixed" : 0.0002
 * }
 */
test('anchorDeposit', async () => {
  const asset_code = 'ETH';
  const account = 'GACW7NONV43MZIFHCOKCQJAKSJSISSICFVUJ2C6EZIW5773OU3HD64VI';
  const how = '1Nh7uHdvY6fNwtQtM1G5EZAFPLC33B59rB';
  const fee_fixed = '0.0002';
  nock(mockURL)
    .get('/deposit')
    .query({
      asset_code,
      account
    })
    .reply(200, {
      how,
      fee_fixed
    });

  const response = await anchor.getDeposit(mockURL, asset_code, account);
  const expectedResponse = { how, fee_fixed };
  expect(response).toEqual(expectedResponse);
});

/**
 * The SEP documentation is not clear how to set type here
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0006.md#request-1
 * sample request
 * GET https://api.example.com/withdraw?asset_code=ETH&dest=0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe
 * sample response
 * {
 * "account_id": "GCIBUCGPOHWMMMFPFTDWBSVHQRT4DIBJ7AD6BZJYDITBK2LCVBYW7HUQ",
 * "memo_type": "id",
 * "memo": "123"
 * }
 */
test('anchorWithdraw', async () => {
  const asset_code = 'ETH';
  const dest = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';
  const account_id = 'GCIBUCGPOHWMMMFPFTDWBSVHQRT4DIBJ7AD6BZJYDITBK2LCVBYW7HUQ';
  const memo_type = 'id';
  const memo = '123';
  nock(mockURL)
    .get('/withdraw')
    .query({
      type: 'crypto',
      asset_code,
      dest
    })
    .reply(200, {
      account_id,
      memo_type,
      memo
    });
  const response = await anchor.getWithdraw(mockURL, 'crypto', asset_code, dest);
  const expectedResponse = { account_id, memo_type, memo };
  expect(response).toEqual(expectedResponse);
});

/**
 * sample request
 * GET TRANSFER_SERVER/info
 * sample response
 * {
 * "deposit": {
 *   "USD": {
 *     "enabled": true,
 *     "fee_fixed": 5,
 *     "fee_percent": 1,
 *     "fields": {
 *       "email_address" : {
 *         "description": "your email address for transaction status updates",
 *         "optional": true
 *       },
 *       "amount" : {
 *         "description": "amount in USD that you plan to deposit"
 *       },
 *       "type" : {
 *         "description": "type of deposit to make",
 *         "choices": ["SEPA", "SWIFT", "cash"]
 *       }
 *     }
 *   },
 *   "ETH": {
 *     "enabled": true,
 *     "fee_fixed": 0.002,
 *     "fee_percent": 0
 *   }
 * },
 * "withdraw": {
 *   "USD": {
 *     "enabled": true,
 *     "fee_fixed": 5,
 *     "fee_percent": 0,
 *     "types": {
 *       "bank_account": {
 *         "fields": {
 *             "dest": {"description": "your bank account number" },
 *             "dest_extra": { "description": "your routing number" },
 *             "bank_branch": { "description": "address of your bank branch" },
 *             "phone_number": { "description": "your phone number in case there's an issue" }
 *         }
 *       },
 *       "cash": {
 *         "fields": {
 *           "dest": { "description": "your email address. Your cashout PIN will be sent here." }
 *         }
 *       }
 *     }
 *   },
 *   "ETH": {
 *     "enabled": false
 *   }
 * },
 * "transactions": {
 *   "enabled": true
 * }
 *}
 */
test('anchorInfo', async () => {
  const types = {
    bank_account: {
      fields: {
        dest: { description: 'your bank account number' },
        dest_extra: { description: 'your routing number' },
        bank_branch: { description: 'address of your bank branch' },
        phone_number: { description: "your phone number in case there's an issue" }
      }
    },
    cash: {
      fields: {
        dest: { description: 'your email address. Your cashout PIN will be sent here.' }
      }
    }
  };
  const USD = {
    enabled: true, fee_fixed: 5, fee_percent: 0, types
  };
  const ETH = {
    enabled: false
  };

  const deposit = {
    USD: {
      enabled: true,
      fee_fixed: 5,
      fee_percent: 1,
      fields: {
        email_address: {
          description: 'your email address for transaction status updates',
          optional: true
        },
        amount: {
          description: 'amount in USD that you plan to deposit'
        },
        type: {
          description: 'type of deposit to make',
          choices: ['SEPA', 'SWIFT', 'cash']
        }
      }
    },
    ETH: {
      enabled: true,
      fee_fixed: 0.002,
      fee_percent: 0
    }
  };
  const withdraw = { USD, ETH };
  const transactions = { enabled: true };
  nock(mockURL)
    .get('/info')
    .reply(200, {
      deposit,
      withdraw,
      transactions
    });

  const response = await anchor.getInfo(mockURL);
  const expectedResponse = { deposit, withdraw, transactions };
  expect(response).toEqual(expectedResponse);
});

/**
 * sample request
 * GET TRANSFER_SERVER/transactions
 * sample response
 * {
  "transactions": [
    {
      "id": "82fhs729f63dh0v4",
      "kind": "deposit",
      "status": "pending_external",
      "status_eta": 3600,
      "external_transaction_id": "2dd16cb409513026fbe7defc0c6f826c2d2c65c3da993f747d09bf7dafd31093",
      "amount_in": "18.34",
      "amount_out": "18.24",
      "amount_fee": "0.1",
      "started_at": "2017-03-20T17:05:32Z"
    },
    {
      "id": "82fhs729f63dh0v4",
      "kind": "withdrawal",
      "status": "completed",
      "amount_in": "500",
      "amount_out": "495",
      "amount_fee": "3",
      "started_at": "2017-03-20T17:00:02Z",
      "completed_at": "2017-03-20T17:09:58Z",
      "stellar_transaction_id": "17a670bc424ff5ce3b386dbfaae9990b66a2a37b4fbe51547e8794962a3f9e6a",
      "external_transaction_id": "2dd16cb409513026fbe7defc0c6f826c2d2c65c3da993f747d09bf7dafd31093"
    }
  ]
}
 */
test('anchorTransactions', async () => {
  const asset_code = '123';
  const account = 'G123123';
  const transactions = [{
    id: '82fhs729f63dh0v4',
    kind: 'deposit',
    status: 'pending_external',
    status_eta: 3600,
    external_transaction_id: '2dd16cb409513026fbe7defc0c6f826c2d2c65c3da993f747d09bf7dafd31093',
    amount_in: '18.34',
    amount_out: '18.24',
    amount_fee: '0.1',
    started_at: '2017-03-20T17:05:32Z'
  },
  {
    id: '82fhs729f63dh0v4',
    kind: 'withdrawal',
    status: 'completed',
    amount_in: '500',
    amount_out: '495',
    amount_fee: '3',
    started_at: '2017-03-20T17:00:02Z',
    completed_at: '2017-03-20T17:09:58Z',
    stellar_transaction_id: '17a670bc424ff5ce3b386dbfaae9990b66a2a37b4fbe51547e8794962a3f9e6a',
    external_transaction_id: '2dd16cb409513026fbe7defc0c6f826c2d2c65c3da993f747d09bf7dafd31093'
  }];
  nock(mockURL)
    .get('/transactions')
    .query({
      asset_code,
      account
    })
    .reply(200, {
      transactions
    });

  const response = await anchor.getTransactionHistory(mockURL, asset_code, account);
  const expectedResponse = { transactions };
  expect(response).toEqual(expectedResponse);
});

/**
 * If the transaction history is empty
 */
test('anchorTransactions', async () => {
  const asset_code = '123';
  const account = 'G123123';
  const emptyTransactionResponse = { error: 'This anchor doesn\'t support the given currency code: ETH' };
  nock(mockURL)
    .get('/transactions')
    .query({
      asset_code,
      account
    })
    .reply(200, {
      emptyTransactionResponse
    });

  const response = await anchor.getTransactionHistory(mockURL, asset_code, account);
  const expectedResponse = { emptyTransactionResponse };
  expect(response).toEqual(expectedResponse);
});
