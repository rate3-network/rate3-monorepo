const secp256k1 = require('secp256k1');

// Big numbers
const { BigNumber } = web3;
const should = require('chai').use(require('chai-bignumber')(BigNumber)).should();

// Track gas
let gasUsed = 0;
let totalGas = 0;

export const getAndClearGas = () => {
    const t = gasUsed;
    gasUsed = 0;
    return t;
};

export const printTestGas = () => {
    totalGas += gasUsed;
    console.log(`\tTest only: ${getAndClearGas().toLocaleString()} gas`.grey);
};

// Measure gas
export const measureTx = async (txHash) => {
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    gasUsed += receipt.gasUsed;
};

export const assertOkTx = async (promise) => {
    const r = await promise;
    gasUsed += r.receipt.gasUsed;
    assert.isOk(r);
    return r;
};

export const assertBlockGasLimit = (atLeast) => {
    const block = web3.eth.getBlock('latest');
    const limit = block.gasLimit;
    assert.isAtLeast(limit, atLeast);
};

export const assertRevert = async (promise) => {
    try {
        await promise;
    } catch (error) {
        error.message.should.include('revert', `Expected "revert", got ${error} instead`);
        return;
    }
    should.fail('Expected revert not received');
};

const fromRpcSig = (sig) => {
    // NOTE: with potential introduction of chainId this might need to be updated
    if (sig.length !== 65) {
        throw new Error('Invalid signature length');
    }

    let v = sig[64];
    // support both versions of `eth_sign` responses
    if (v < 27) {
        v += 27;
    }

    return {
        v,
        r: sig.slice(0, 32),
        s: sig.slice(32, 64),
    };
};

export const ecrecover = (msg, signature) => {
    const sigBuffer = signature.slice(0, 2) === '0x'
        ? Buffer.from(signature.slice(2), 'hex')
        : Buffer.from(signature, 'hex');

    const hashedMessage = web3.sha3(
        `${web3.toHex('\x19Ethereum Signed Message:\n32')}${web3.toHex(msg).slice(2)}`,
        { encoding: 'hex' },
    );

    const { v, r, s } = fromRpcSig(sigBuffer);
    const recovery = v - 27;
    if (!(recovery === 0 || recovery === 1)) {
        throw new Error('Invalid signature v value');
    }

    const senderPubKey = secp256k1.recover(
        Buffer.from(hashedMessage.slice(2), 'hex'),
        Buffer.concat([r, s], 64),
        recovery,
    );

    const pubKey = secp256k1.publicKeyConvert(senderPubKey, false).slice(1);
    const addr = web3.sha3(
        `0x${pubKey.toString('hex')}`,
        { encoding: 'hex' },
    ).slice(-40);

    return `0x${addr}`;
};
