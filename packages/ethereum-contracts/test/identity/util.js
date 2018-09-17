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
