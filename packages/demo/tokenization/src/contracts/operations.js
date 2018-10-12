const abi = [
  {
    constant: false,
    inputs: [
      {
        name: '_newTokenContract',
        type: 'address',
      },
    ],
    name: 'setToken',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '',
        type: 'address',
      },
      {
        name: '',
        type: 'uint256',
      },
    ],
    name: 'mintRequestOperations',
    outputs: [
      {
        name: 'by',
        type: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
      },
      {
        name: 'requestTimestamp',
        type: 'uint256',
      },
      {
        name: 'approvedBy',
        type: 'address',
      },
      {
        name: 'approved',
        type: 'bool',
      },
      {
        name: 'approvalTimestamp',
        type: 'uint256',
      },
      {
        name: 'finalizeTimestamp',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'claimOwnership',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'operationDelay',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_newAdminAddress',
        type: 'address',
      },
    ],
    name: 'setAdmin',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'owner',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '',
        type: 'address',
      },
      {
        name: '',
        type: 'uint256',
      },
    ],
    name: 'burnRequestOperations',
    outputs: [
      {
        name: 'by',
        type: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
      },
      {
        name: 'requestTimestamp',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'pendingOwner',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'admin',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'token',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: '_token',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'by',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'requestTimestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'MintOperationRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'by',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'requestTimestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'BurnOperationRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'by',
        type: 'address',
      },
      {
        indexed: true,
        name: 'approvedBy',
        type: 'address',
      },
      {
        indexed: false,
        name: 'approvalTimestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'finalizeTimestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'MintOperationApproved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'by',
        type: 'address',
      },
      {
        indexed: true,
        name: 'finalizedBy',
        type: 'address',
      },
      {
        indexed: false,
        name: 'finalizedTimestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'MintOperationFinalized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'by',
        type: 'address',
      },
      {
        indexed: true,
        name: 'revokedBy',
        type: 'address',
      },
      {
        indexed: false,
        name: 'revokedTimestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'MintOperationRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'previousOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipRenounced',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'requestMint',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_requestor',
        type: 'address',
      },
      {
        name: '_index',
        type: 'uint256',
      },
    ],
    name: 'approveMint',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_requestor',
        type: 'address',
      },
      {
        name: '_index',
        type: 'uint256',
      },
    ],
    name: 'finalizeMint',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_requestor',
        type: 'address',
      },
      {
        name: '_index',
        type: 'uint256',
      },
    ],
    name: 'revokeMint',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'requestBurn',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export default abi;
