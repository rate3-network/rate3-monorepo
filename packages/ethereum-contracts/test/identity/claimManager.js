import {
    AccountsSetupConfig,
    setupTest,
    Purpose,
    Topic,
    Scheme,
} from './base';
import {
    printTestGas,
    assertOkTx,
    assertRevert,
} from './util';

const ClaimStore = artifacts.require('./identity/lib/ClaimStore.sol');

contract('ClaimManager', async (addrs) => {
    let identity;
    let accounts;
    let anotherIdentity;
    let claimStore;

    afterEach('print gas', printTestGas);

    const assertClaim = async (_topic, _issuer, _signature, _data, _uri) => {
        const claimId = await claimStore.getClaimId(_issuer, _topic);
        const [
            topic,
            scheme,
            issuer,
            signature,
            data,
            uri,
        ] = await identity.getClaim(claimId);

        topic.should.be.bignumber.equal(_topic);
        scheme.should.be.bignumber.equal(Scheme.ECDSA);
        assert.equal(issuer, _issuer);
        assert.equal(signature, _signature);
        assert.equal(web3.toAscii(data), _data);
        assert.equal(uri, _uri);
    };

    const assertClaims = async (_total, _topics) => {
        // Check total
        const total = await identity.numClaims();
        total.should.be.bignumber.equal(_total);

        // Check per type
        await Promise.all(Object.keys(_topics).map(async (topic) => {
            const ids = await identity.getClaimIdsByTopic(topic);
            // Check length
            assert.equal(ids.length, _topics[topic]);
        }));
    };

    const findClaimRequestId = r => (
        r.logs.find(e => e.event === 'ClaimRequested').args.claimRequestId
    );

    beforeEach('new contract', async () => {
        const config = (new AccountsSetupConfig())
            .setAnotherAccount(addrs[0])
            .setIdentityAccount(addrs[1])
            .pushAccount(Purpose.MANAGEMENT, addrs[2])
            .pushAccount(Purpose.MANAGEMENT, addrs[3], false)
            .pushAccount(Purpose.ACTION, addrs[4])
            .pushAccount(Purpose.ACTION, addrs[5], false)
            .pushAccount(Purpose.CLAIM, addrs[6]);

        ({ identity, anotherIdentity, accounts } = await setupTest(
            config,
            [
                {
                    topic: Topic.LABEL,
                    data: 'Rate Engineering',
                    uri: 'https://github.com/rate-engineering',
                    self: true,
                },
                {
                    topic: Topic.LABEL,
                    data: 'Rate',
                    uri: '',
                    self: false,
                },
            ],
        ));

        claimStore = await ClaimStore.deployed();
    });

    describe('ERC165', () => {
        it('supports ERC165, ERC725, ERC735', async () => {
            // ERC165
            assert.isFalse(await identity.supportsInterface('0xffffffff'));
            assert.isTrue(await identity.supportsInterface('0x01ffc9a7'));
            // ERC725
            assert.isTrue(await identity.supportsInterface('0xdc3d2a7b'));
            // ERC735
            assert.isTrue(await identity.supportsInterface('0xb6b4ee6d'));
            // ERC725 + ERC735
            assert.isTrue(await identity.supportsInterface('0x6a89c416'));
        });
    });

    describe('addClaim', () => {
        it('can recover signature', async () => {
            const label = 'test';
            // Claim hash
            const toSign = await claimStore.claimToSign(
                identity.address,
                Topic.LABEL,
                label,
            );
            // Sign using eth_sign
            const signature = web3.eth.sign(accounts.manager[0].addr, toSign);
            // Recover address from signature
            const signedBy = await claimStore.getSignatureAddress(toSign, signature);
            assert.equal(signedBy, accounts.manager[0].addr);
        });

        it('can add self-claim as manager', async () => {
            const uri = 'https://twitter.com/ratex_sg';
            // Claim hash
            const toSign = await claimStore.claimToSign(
                identity.address,
                Topic.PROFILE,
                uri,
            );
            // Sign using CLAIM_SIGNER_KEY
            const signature = web3.eth.sign(accounts.claim[0].addr, toSign);

            // Add self-claim as manager
            await assertOkTx(identity.addClaim(
                Topic.PROFILE,
                Scheme.ECDSA,
                identity.address,
                signature,
                uri,
                uri,
                { from: accounts.manager[0].addr },
            ));

            // Check claim
            await assertClaim(Topic.PROFILE, identity.address, signature, uri, uri);

            await assertClaims(3, { [Topic.LABEL]: 2, [Topic.PROFILE]: 1 });
        });

        it('checks signature when adding', async () => {
            const uri = 'https://twitter.com/ratex_sg';
            // Claim hash
            const toSign = await claimStore.claimToSign(
                identity.address,
                Topic.PROFILE,
                uri,
            );
            // Don't sign, create random string
            const invalidSignature = web3.sha3(toSign);

            // Try to add self-claim as manager
            await assertRevert(identity.addClaim(
                Topic.PROFILE,
                Scheme.ECDSA,
                identity.address,
                invalidSignature,
                uri,
                uri,
                { from: accounts.manager[0].addr },
            ));

            // Claim doesn't exist
            const claimId = await claimStore.getClaimId(identity.address, Topic.PROFILE);
            await assertRevert(identity.getClaim(claimId));
        });

        it('can add self-claim with manager approval', async () => {
            const uri = 'https://twitter.com/ratex_sg';
            // Claim hash
            const toSign = await claimStore.claimToSign(
                identity.address,
                Topic.PROFILE,
                uri,
            );
            // Sign using CLAIM_SIGNER_KEY
            const signature = web3.eth.sign(accounts.claim[1].addr, toSign);

            // Add self-claim with claim key
            const r = await assertOkTx(identity.addClaim(
                Topic.PROFILE,
                Scheme.ECDSA,
                identity.address,
                signature,
                uri,
                uri,
                { from: accounts.claim[1].addr },
            ));
            const claimRequestId = findClaimRequestId(r);

            // Claim doesn't exist yet
            const claimId = await claimStore.getClaimId(identity.address, Topic.PROFILE);
            await assertRevert(identity.getClaim(claimId));

            // Approve
            await assertOkTx(identity.approve(
                claimRequestId,
                true,
                { from: accounts.manager[0].addr },
            ));

            // Check claim
            await assertClaim(Topic.PROFILE, identity.address, signature, uri, uri);

            await assertClaims(3, { [Topic.LABEL]: 2, [Topic.PROFILE]: 1 });
        });

        it('other identity can add a claim', async () => {
            const uri = 'https://twitter.com/ratex_sg';
            // Claim hash
            const toSign = await claimStore.claimToSign(
                identity.address,
                Topic.PROFILE,
                uri,
            );
            const signature = web3.eth.sign(accounts.another.addr, toSign);

            // Deployer calls deployedContract.execute(...), which calls identity.addClaim(...)
            const data = identity.contract.addClaim.getData(
                Topic.PROFILE,
                Scheme.ECDSA,
                anotherIdentity.address,
                signature,
                uri,
                uri,
            );
            const r = await assertOkTx(anotherIdentity.execute(
                identity.address,
                0,
                data,
                { from: accounts.another.addr },
            ));
            const claimRequestId = findClaimRequestId(r);

            // Claim doesn't exist yet
            await assertClaims(2, { [Topic.LABEL]: 2 });

            // Approve
            await assertOkTx(identity.approve(
                claimRequestId,
                true,
                { from: accounts.manager[0].addr },
            ));

            // Check claim
            await assertClaim(
                Topic.PROFILE,
                anotherIdentity.address,
                signature,
                uri,
                uri,
            );
            await assertClaims(3, { [Topic.LABEL]: 2, [Topic.PROFILE]: 1 });
        });
    });

    describe('changeClaim', () => {
        it('can update a self-claim', async () => {
            const label = 'Rate Engineering';
            const uri = 'https://github.com/rate-engineering';
            const newUri = 'https://medium.com/ratex-engineering';

            // Claim hash
            const toSign = await claimStore.claimToSign(
                identity.address,
                Topic.LABEL,
                label,
            );
            // Sign using CLAIM_SIGNER_KEY
            const signature = web3.eth.sign(accounts.claim[0].addr, toSign);
            // Check claim exists
            await assertClaim(
                Topic.LABEL,
                identity.address,
                signature,
                label,
                uri,
            );

            // Use same signature to update URI
            await assertOkTx(identity.addClaim(
                Topic.LABEL,
                Scheme.ECDSA,
                identity.address,
                signature,
                label,
                newUri,
                { from: accounts.manager[1].addr },
            ));

            // Check claim was updated
            await assertClaim(
                Topic.LABEL,
                identity.address,
                signature,
                label,
                newUri,
            );

            await assertClaims(2, { [Topic.LABEL]: 2 });
        });

        it('checks signature when updating', async () => {
            const label = 'Rate Engineering';
            const uri = 'https://github.com/rate-engineering';
            const newUri = 'https://medium.com/ratex-engineering';

            // Claim hash
            const toSign = await claimStore.claimToSign(
                identity.address,
                Topic.LABEL,
                label,
            );
            // Don't sign, create random string
            const signature = web3.eth.sign(accounts.claim[0].addr, toSign);
            const invalidSignature = web3.sha3(toSign);

            // Try to update self-claim as manager
            await assertRevert(identity.addClaim(
                Topic.LABEL,
                Scheme.ECDSA,
                identity.address,
                invalidSignature,
                label,
                newUri,
                { from: accounts.manager[1].addr },
            ));

            // Claim is unchanged
            await assertClaim(
                Topic.LABEL,
                identity.address,
                signature,
                label,
                uri,
            );
        });

        it('needs approval to update a self-claim', async () => {
            const label = 'Rate Engineering';
            const uri = 'https://github.com/rate-engineering';
            const newUri = 'https://medium.com/ratex-engineering';

            // Claim hash
            const toSign = await claimStore.claimToSign(
                identity.address,
                Topic.LABEL,
                label,
            );
            // Sign using CLAIM_SIGNER_KEY
            const signature = web3.eth.sign(accounts.claim[0].addr, toSign);
            // Check claim
            await assertClaim(
                Topic.LABEL,
                identity.address,
                signature,
                label,
                uri,
            );

            // Use same signature to update URI
            const r = await assertOkTx(identity.addClaim(
                Topic.LABEL,
                Scheme.ECDSA,
                identity.address,
                signature,
                label,
                newUri,
                { from: accounts.claim[1].addr },
            ));
            const claimRequestId = findClaimRequestId(r);

            // Check claim wasn't updated
            await assertClaim(
                Topic.LABEL,
                identity.address,
                signature,
                label,
                uri,
            );

            // Approve
            await assertOkTx(identity.approve(
                claimRequestId,
                true,
                { from: accounts.manager[1].addr },
            ));

            // Check claim was updated
            await assertClaim(
                Topic.LABEL,
                identity.address,
                signature,
                label,
                newUri,
            );

            await assertClaims(2, { [Topic.LABEL]: 2 });
        });

        it('other identity can update a claim', async () => {
            const claimId = await claimStore.getClaimId(
                anotherIdentity.address,
                Topic.LABEL,
            );
            // Use same signature as before, but update uri
            const [, , , signature, dataBytes, uri] = await identity.getClaim(claimId);
            const label = web3.toAscii(dataBytes);
            const newUri = 'https://medium.com/ratex-engineering';

            // Deployer calls deployedContract.execute(...), which calls identity.addClaim(...)
            const data = identity.contract.addClaim.getData(
                Topic.LABEL,
                Scheme.ECDSA,
                anotherIdentity.address,
                signature,
                label,
                newUri,
            );
            const r = await assertOkTx(anotherIdentity.execute(
                identity.address,
                0,
                data,
                { from: accounts.another.addr },
            ));
            const claimRequestId = findClaimRequestId(r);

            // Claim hasn't been updated yet
            await assertClaim(
                Topic.LABEL,
                anotherIdentity.address,
                signature,
                label,
                uri,
            );

            // Approve
            await assertOkTx(identity.approve(
                claimRequestId,
                true,
                { from: accounts.manager[1].addr },
            ));

            // Check claim
            await assertClaim(
                Topic.LABEL,
                anotherIdentity.address,
                signature,
                label,
                newUri,
            );
            await assertClaims(2, { [Topic.LABEL]: 2 });
        });
    });

    describe('removeClaim', async () => {
        it('can remove a claim', async () => {
            // First claim
            const claimId = await claimStore.getClaimId(identity.address, Topic.LABEL);

            // Remove it
            await assertOkTx(identity.removeClaim(
                claimId,
                { from: accounts.manager[1].addr },
            ));

            // Check claim no longer exists
            await assertRevert(identity.getClaim(claimId));

            await assertClaims(1, { [Topic.LABEL]: 1 });
        });

        it('other identity can remove a claim as a contract', async () => {
            await assertClaims(2, { [Topic.LABEL]: 2 });

            const claimId = await claimStore.getClaimId(
                anotherIdentity.address,
                Topic.LABEL,
            );

            // Remove claim as contract
            const data = identity.contract.removeClaim.getData(claimId);
            await assertOkTx(anotherIdentity.execute(
                identity.address,
                0,
                data,
                { from: accounts.another.addr },
            ));

            // Check claim no longer exists
            await assertRevert(identity.getClaim(claimId));

            await assertClaims(1, { [Topic.LABEL]: 1 });
        });

        it('other identity can remove a claim', async () => {
            await assertClaims(2, { [Topic.LABEL]: 2 });

            const claimId = await claimStore.getClaimId(
                anotherIdentity.address,
                Topic.LABEL,
            );

            // Remove claim using action key
            await assertOkTx(identity.removeClaim(
                claimId,
                { from: accounts.another.addr },
            ));

            // Check claim no longer exists
            await assertRevert(identity.getClaim(claimId));

            await assertClaims(1, { [Topic.LABEL]: 1 });
        });
    });

    // TODO: test ClaimRequested, ClaimAdded, ClaimRemoved, ClaimChanged
});
