import { advanceBlock } from '../helpers/advanceToBlock';
import {
    getAndClearGas,
    assertBlockGasLimit,
    measureTx,
} from './util';

const Identity = artifacts.require('./identity/Identity.sol');
const KeyEnums = artifacts.require('./identity/constants/KeyEnums.sol');
const ClaimStore = artifacts.require('./identity/lib/ClaimStore.sol');

// Constants
export const Purpose = {
    MANAGEMENT: 1,
    ACTION: 2,
    CLAIM: 3,
    ENCRYPT: 4,
};

export const KeyType = {
    ECDSA: 1,
};

export const Topic = {
    BIOMETRIC: 1,
    RESIDENCE: 2,
    REGISTRY: 3,
    PROFILE: 4,
    LABEL: 5,
};

export const Scheme = {
    ECDSA: 1,
    RSA: 2,
    CONTRACT: 3,
};

const purposeNames = {
    [Purpose.MANAGEMENT]: 'manager',
    [Purpose.ACTION]: 'action',
    [Purpose.CLAIM]: 'claim',
    [Purpose.ENCRYPT]: 'encrypt',
};

export const assertKeyCount = async (identity, purpose, count) => {
    const keys = await identity.getKeysByPurpose(purpose);
    assert.equal(keys.length, count);
};

export const addrToBytes32 = addr => `0x${addr.substring(2).padStart(64, '0')}`;

export class Account {
    constructor(addr) {
        this.addr = addr;
        this.key = addrToBytes32(addr);
    }
}

export class AccountsSetupConfig {
    constructor() {
        this.ownerKeyPurposes = {
            [Purpose.MANAGEMENT]: true,
            [Purpose.ACTION]: true,
            [Purpose.CLAIM]: true,
        };

        this.accountsToAdd = {
            [Purpose.MANAGEMENT]: [],
            [Purpose.ACTION]: [],
            [Purpose.CLAIM]: [],
            [Purpose.ENCRYPT]: [],
        };

        this.allAccounts = {
            [Purpose.MANAGEMENT]: [],
            [Purpose.ACTION]: [],
            [Purpose.CLAIM]: [],
            [Purpose.ENCRYPT]: [],
        };

        this.uniqueAddrToAdd = {};

        return this;
    }

    setIdentityAccount(addr) {
        if (this.identityAccount != null) {
            throw new Error('Identity account has already been set');
        }
        this.identityAccount = new Account(addr);
        this.uniqueAddrToAdd[addr] = true;
        [
            Purpose.MANAGEMENT,
            Purpose.ACTION,
            Purpose.CLAIM,
        ].forEach((purpose) => {
            this.allAccounts[purpose] = [
                this.identityAccount,
                ...this.allAccounts[purpose],
            ];
        });
        return this;
    }

    setAnotherAccount(addr) {
        if (this.anotherAccount != null) {
            throw new Error('Another account has already been set');
        }
        this.anotherAccount = new Account(addr);
        return this;
    }

    pushAccount(purpose, addr, toAdd = true) {
        if (!Object.prototype.hasOwnProperty.call(purposeNames, purpose)) {
            throw new Error(`No such purpose: ${purpose}`);
        }

        this.allAccounts[purpose].push(new Account(addr));
        if (toAdd) {
            this.accountsToAdd[purpose].push(new Account(addr));
            this.uniqueAddrToAdd[addr] = true;
        }

        return this;
    }

    totalKeysToAdd() {
        return Object.keys(this.uniqueAddrToAdd).length;
    }
}

/**
 * Setup test environment
 *
 * @param {Array} accounts
 * @param {Object} init
 * @param {Object} total
 * @param {Array} [claims=[]]
 * @param {number} [managementThreshold=1]
 * @param {number} [actionThreshold=1]
 * @param {number} [blockGasLimit=10000000]
 * @returns {Object}
 */
export const setupTest = async (
    accountsSetupConfig,
    claims = [],
    blockGasLimit = 4700000,
) => {
    assert(
        accountsSetupConfig.identityAccount != null,
        'Identity account is not set',
    );
    assert(
        accountsSetupConfig.anotherAccount != null,
        'Another account is not set',
    );

    // Check block gas limit is appropriate
    assertBlockGasLimit(blockGasLimit);

    const keyEnums = await KeyEnums.deployed();

    // Use deployed identity for another identity
    const anotherIdentity = await Identity.new(
        accountsSetupConfig.anotherAccount.addr,
        keyEnums.address,
        { from: accountsSetupConfig.anotherAccount.addr, gas: blockGasLimit },
    );
    measureTx(anotherIdentity.transactionHash);

    await advanceBlock();

    const identity = await Identity.new(
        accountsSetupConfig.identityAccount.addr,
        keyEnums.address,
        { from: accountsSetupConfig.identityAccount.addr, gas: blockGasLimit },
    );
    measureTx(anotherIdentity.transactionHash);

    await advanceBlock();

    const addKeyTxns = await Promise.all(
        Object.keys(accountsSetupConfig.accountsToAdd).map(purpose => (
            Promise.all(accountsSetupConfig.accountsToAdd[purpose].map(acc => (
                identity.addKey(acc.key, purpose, KeyType.ECDSA, {
                    from: accountsSetupConfig.identityAccount.addr,
                })
            )))
        )),
    );
    addKeyTxns.forEach(txns => txns.forEach(tx => measureTx(tx.tx)));

    await advanceBlock();

    // Init self-claims to be sent in constructor
    if (claims.length > 0) {
        const claimStore = await ClaimStore.deployed();
        await Promise.all(claims.map(async ({
            topic,
            data,
            uri,
            self,
        }) => {
            // Claim hash
            const claimHash = await claimStore.claimToSign(identity.address, topic, data);
            // Sign using CLAIM_SIGNER_KEY
            const claimSigner = self
                ? accountsSetupConfig.identityAccount.addr
                : accountsSetupConfig.anotherAccount.addr;
            const signature = web3.eth.sign(claimSigner, claimHash);

            const r = await identity.addClaim(
                topic,
                Scheme.ECDSA,
                self ? identity.address : anotherIdentity.address,
                signature,
                data,
                uri,
            );
            measureTx(r.tx);

            const { args: { claimRequestId } } = r.logs
                .find(e => e.event === 'ClaimRequested');

            const a = await identity.approve(
                claimRequestId,
                true,
                { from: accountsSetupConfig.identityAccount.addr },
            );
            measureTx(a.tx);
        }));
    }

    // Check init keys
    const contractKeys = await identity.numKeys();
    // +1 because the owner identity key is only a single key that serves 3 purposes
    contractKeys.should.be.bignumber.equal(accountsSetupConfig.totalKeysToAdd());
    // Check init claims
    const contractClaims = await identity.numClaims();
    contractClaims.should.be.bignumber.equal(claims.length);

    getAndClearGas();

    return {
        identity,
        accounts: {
            identity: accountsSetupConfig.identityAccount,
            another: accountsSetupConfig.anotherAccount,
            ...Object.keys(accountsSetupConfig.allAccounts).reduce((prev, curr) => ({
                [purposeNames[curr]]: accountsSetupConfig.allAccounts[curr],
                ...prev,
            }), {}),
        },
        anotherIdentity,
    };
};
