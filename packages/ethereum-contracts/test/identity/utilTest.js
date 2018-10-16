import {
    ecrecover,
    fromRpcSig,
} from './util';

// eslint-disable-next-line no-unused-vars
const ecprivkey = Buffer.from('3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1', 'hex');
const ecpubKey = Buffer.from('ED54a7C1d8634BB589f24Bb7F05a5554b36F9618', 'hex');
const message = 'test';
const chainId = 3; // ropsten
const rHex = 'c4819b22369246576687b87c8072aed4abfa243706d974b588e35d8e54fd799b';
const sHex = '179a35aedad5671163e4ecf8f715e558cdfbf63a491c38c80028b5f9425165a3';
const sig1 = `0x${rHex}${sHex}01`;
const sig2 = `0x${rHex}${sHex}1c`;

describe('message sig', () => {
    const r = Buffer.from(rHex, 'hex');
    const s = Buffer.from(sHex, 'hex');

    it('should return hex strings that the RPC can use', () => {
        assert.deepEqual(fromRpcSig(Buffer.from(sig1.slice(2), 'hex')), {
            v: 28,
            r,
            s,
        });
        assert.deepEqual(fromRpcSig(Buffer.from(sig2.slice(2), 'hex')), {
            v: 28,
            r,
            s,
        });
    });

    it('should throw on invalid length', () => {
        assert.throws(() => {
            fromRpcSig('');
        });
        assert.throws(() => {
            fromRpcSig(`${sig1}42`);
        });
    });
});

describe('ecrecover', () => {
    it('should recover a public key', () => {
        const pubkey = ecrecover(
            web3.fromAscii(message),
            sig1,
        );
        assert.deepEqual(pubkey, `0x${ecpubKey.toString('hex')}`);
    });

    it('should recover a public key (chainId = 3)', () => {
        const pubkey = ecrecover(
            web3.fromAscii(message),
            `0x${rHex}${sHex}2a`,
            chainId,
        );
        assert.deepEqual(pubkey, `0x${ecpubKey.toString('hex')}`);
    });
});
