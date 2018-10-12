import {
    AccountsSetupConfig,
    setupTest,
    Purpose,
    Topic,
    Scheme,
    Claim,
    getClaimId,
    getToSign,
} from './base';
import {
    printTestGas,
    assertOkTx,
    assertRevert,
    ecrecover,
} from './util';
import getEvents from '../helpers/getEvents';

const assertClaim = async (identityContract, _claim) => {
    const [
        topic,
        scheme,
        issuer,
        signature,
        data,
        uri,
    ] = await identityContract.getClaim(_claim.id());

    topic.should.be.bignumber.equal(_claim.topic);
    scheme.should.be.bignumber.equal(_claim.scheme);
    assert.equal(issuer, _claim.issuerAddr);
    assert.equal(signature, _claim.signature);
    assert.equal(web3.toAscii(data), _claim.data);
    assert.equal(uri, _claim.uri);
};

const assertClaimsCount = async (identityContract, _total, _topics) => {
    // Check total
    const total = await identityContract.numClaims();
    total.should.be.bignumber.equal(_total);

    // Check per type
    await Promise.all(Object.keys(_topics).map(async (topic) => {
        const ids = await identityContract.getClaimIdsByTopic(topic);
        // Check length
        assert.equal(ids.length, _topics[topic]);
    }));
};

contract('ClaimManager Tests', async (addrs) => {
    let identity;
    let accounts;
    let anotherIdentity;

    afterEach('print gas', printTestGas);

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

    });

    describe('Test - ERC165', () => {
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

    describe('Test - Add claim', () => {
        it('can recover signature', async () => {
            const claim = new Claim(
                Topic.LABEL,
                Scheme.ECDSA,
                accounts.claim[0].addr,
                identity.address,
                identity.address,
                'test',
            );
            const label = 'test';
            // Claim hash
            const toSign = getToSign(identity.address, Topic.LABEL, label);
            toSign.should.be.equal(claim.toSign);
            // Recover address from signature
            const signedBy = ecrecover(toSign, claim.signature);
            assert.equal(signedBy, claim.signerAddr);
        });

        it('can add self-claim as manager', async () => {
            const claim = new Claim(
                Topic.PROFILE,
                Scheme.ECDSA,
                accounts.manager[0].addr,
                identity.address,
                identity.address,
                'https://twitter.com/ratex_sg',
                'https://twitter.com/ratex_sg',
            );

            // Add self-claim as manager
            await assertOkTx(identity.addClaim(
                ...claim.addClaimArgs(),
                { from: accounts.manager[0].addr },
            ));

            // Check claim
            await assertClaim(identity, claim);
            await assertClaimsCount(identity, 3, {
                [Topic.LABEL]: 2,
                [Topic.PROFILE]: 1,
            });

            // Check ClaimAdded event
            const logs = await getEvents(identity, claim.claimAddedEvent());
            logs.should.have.a.lengthOf(1);
        });

        it('can add self-claim with manager approval', async () => {
            const claim = new Claim(
                Topic.PROFILE,
                Scheme.ECDSA,
                accounts.claim[1].addr,
                identity.address,
                identity.address,
                'https://twitter.com/ratex_sg',
                'https://twitter.com/ratex_sg',
            );

            // Add self-claim with claim key
            await assertOkTx(identity.addClaim(
                ...claim.addClaimArgs(),
                { from: accounts.claim[1].addr },
            ));

            // Check ClaimRequested event
            let logs = await getEvents(identity, claim.claimRequestedEvent());
            logs.should.have.a.lengthOf(1);
            const { args: { claimRequestId } } = logs[0];

            // Claim doesn't exist yet
            await assertRevert(identity.getClaim(claim.id()));

            // Approve
            await assertOkTx(identity.approve(
                claimRequestId,
                true,
                { from: accounts.manager[0].addr },
            ));

            // Check Approved event
            logs = await getEvents(identity, {
                event: 'Approved',
                args: {
                    executionId: claimRequestId,
                    approved: true,
                },
            });
            logs.should.have.a.lengthOf(1);

            // Check claim
            await assertClaim(identity, claim);
            await assertClaimsCount(identity, 3, {
                [Topic.LABEL]: 2,
                [Topic.PROFILE]: 1,
            });

            // Check ClaimAdded event
            logs = await getEvents(identity, claim.claimAddedEvent());
            logs.should.have.a.lengthOf(1);
        });

        it('other identity can add a claim', async () => {
            const claim = new Claim(
                Topic.PROFILE,
                Scheme.ECDSA,
                accounts.another.addr,
                anotherIdentity.address,
                identity.address,
                'https://twitter.com/ratex_sg',
                'https://twitter.com/ratex_sg',
            );

            // Deployer calls deployedContract.execute(...), which calls identity.addClaim(...)
            const data = identity.contract.addClaim.getData(
                ...claim.addClaimArgs(),
            );
            await assertOkTx(anotherIdentity.execute(
                identity.address,
                0,
                data,
                { from: accounts.another.addr },
            ));

            // Check ClaimRequested event
            let logs = await getEvents(identity, claim.claimRequestedEvent());
            logs.should.have.a.lengthOf(1);
            const { args: { claimRequestId } } = logs[0];

            // Claim doesn't exist yet
            await assertClaimsCount(identity, 2, { [Topic.LABEL]: 2 });

            // Approve
            await assertOkTx(identity.approve(
                claimRequestId,
                true,
                { from: accounts.manager[0].addr },
            ));

            // Check Approved event
            logs = await getEvents(identity, {
                event: 'Approved',
                args: {
                    executionId: claimRequestId,
                    approved: true,
                },
            });
            logs.should.have.a.lengthOf(1);

            // Check claim
            await assertClaim(identity, claim);
            await assertClaimsCount(identity, 3, {
                [Topic.LABEL]: 2,
                [Topic.PROFILE]: 1,
            });

            // Check ClaimAdded event
            logs = await getEvents(identity, claim.claimAddedEvent());
            logs.should.have.a.lengthOf(1);
        });
    });

    describe('Test - Change claim', () => {
        it('can update a self-claim', async () => {
            const uri = 'https://github.com/rate-engineering';
            const newUri = 'https://medium.com/ratex-engineering';
            const claim = new Claim(
                Topic.LABEL,
                Scheme.ECDSA,
                accounts.claim[0].addr,
                identity.address,
                identity.address,
                'Rate Engineering',
                uri,
            );

            // Check claim exists
            await assertClaim(identity, claim);

            claim.uri.should.be.equal(uri);
            claim.uri = newUri;
            claim.uri.should.be.equal(newUri);

            // Use same signature to update URI
            await assertOkTx(identity.addClaim(
                ...claim.addClaimArgs(),
                { from: accounts.manager[1].addr },
            ));

            // Check claim was updated
            await assertClaim(identity, claim);
            await assertClaimsCount(identity, 2, { [Topic.LABEL]: 2 });
        });

        it('needs approval to update a self-claim', async () => {
            const uri = 'https://github.com/rate-engineering';
            const newUri = 'https://medium.com/ratex-engineering';
            const claim = new Claim(
                Topic.LABEL,
                Scheme.ECDSA,
                accounts.claim[0].addr,
                identity.address,
                identity.address,
                'Rate Engineering',
                uri,
            );

            // Check claim
            await assertClaim(identity, claim);
            await assertClaimsCount(identity, 2, { [Topic.LABEL]: 2 });

            // Change to new value
            claim.uri.should.be.equal(uri);
            claim.uri = newUri;
            claim.uri.should.be.equal(newUri);

            // Use same signature to update URI
            // send from non-management account
            await assertOkTx(identity.addClaim(
                ...claim.addClaimArgs(),
                { from: accounts.claim[1].addr },
            ));

            // Check ClaimRequested event
            let logs = await getEvents(identity, claim.claimRequestedEvent());
            logs.should.have.a.lengthOf(1);
            const { args: { claimRequestId } } = logs[0];

            // Check claim wasn't updated
            claim.uri = uri;
            await assertClaim(identity, claim);
            claim.uri = newUri;

            // Approve
            await assertOkTx(identity.approve(
                claimRequestId,
                true,
                { from: accounts.manager[1].addr },
            ));

            // Check Approved event
            logs = await getEvents(identity, {
                event: 'Approved',
                args: {
                    executionId: claimRequestId,
                    approved: true,
                },
            });
            logs.should.have.a.lengthOf(1);

            // Check claim was updated
            await assertClaim(identity, claim);
            await assertClaimsCount(identity, 2, { [Topic.LABEL]: 2 });

            // Check ClaimAdded event
            logs = await getEvents(identity, claim.claimChangedEvent());
            logs.should.have.a.lengthOf(1);
        });

        it('other identity can update a claim', async () => {
            const claimId = getClaimId(anotherIdentity.address, Topic.LABEL);
            // Use same signature as before, but update uri
            const [
                topic,
                scheme,
                issuerAddr,
                signature,
                dataBytes,
                uri,
            ] = await identity.getClaim(claimId);
            const newUri = 'https://medium.com/ratex-engineering';
            const claim = new Claim(
                topic,
                scheme,
                accounts.another.addr,
                issuerAddr,
                identity.addr,
                web3.toAscii(dataBytes),
                newUri,
            );
            claim.signature = signature;

            await assertClaimsCount(identity, 2, { [Topic.LABEL]: 2 });

            // Deployer calls deployedContract.execute(...), which calls identity.addClaim(...)
            const data = identity.contract.addClaim.getData(
                ...claim.addClaimArgs(),
            );
            await assertOkTx(anotherIdentity.execute(
                identity.address,
                0,
                data,
                { from: accounts.another.addr },
            ));

            // Check ClaimRequested event
            let logs = await getEvents(identity, claim.claimRequestedEvent());
            logs.should.have.a.lengthOf(1);
            const { args: { claimRequestId } } = logs[0];

            // Claim hasn't been updated yet
            claim.uri = uri;
            await assertClaim(identity, claim);
            claim.uri = newUri;

            // Approve
            await assertOkTx(identity.approve(
                claimRequestId,
                true,
                { from: accounts.manager[1].addr },
            ));

            // Check Approved event
            logs = await getEvents(identity, {
                event: 'Approved',
                args: {
                    executionId: claimRequestId,
                    approved: true,
                },
            });
            logs.should.have.a.lengthOf(1);

            // Check claim was updated
            await assertClaim(identity, claim);
            await assertClaimsCount(identity, 2, { [Topic.LABEL]: 2 });

            // Check ClaimAdded event
            logs = await getEvents(identity, claim.claimChangedEvent());
            logs.should.have.a.lengthOf(1);
        });
    });

    describe('Test - Remove claim', async () => {
        it('can remove a claim', async () => {
            // First claim
            const claimId = getClaimId(identity.address, Topic.LABEL);

            // Remove it
            await assertOkTx(identity.removeClaim(
                claimId,
                { from: accounts.manager[1].addr },
            ));

            // Check claim no longer exists
            await assertRevert(identity.getClaim(claimId));

            // Check ClaimRemoved event
            const logs = await getEvents(identity, {
                event: 'ClaimRemoved',
                args: {
                    topic: new web3.BigNumber(Topic.LABEL),
                    issuer: identity.address,
                },
            });
            logs.should.have.a.lengthOf(1);

            await assertClaimsCount(identity, 1, { [Topic.LABEL]: 1 });
        });

        it('other identity can remove a claim as a contract', async () => {
            await assertClaimsCount(identity, 2, { [Topic.LABEL]: 2 });

            const claimId = getClaimId(anotherIdentity.address, Topic.LABEL);

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

            // Check ClaimRemoved event
            const logs = await getEvents(identity, {
                event: 'ClaimRemoved',
                args: {
                    topic: new web3.BigNumber(Topic.LABEL),
                    issuer: anotherIdentity.address,
                },
            });
            logs.should.have.a.lengthOf(1);

            await assertClaimsCount(identity, 1, { [Topic.LABEL]: 1 });
        });

        it('other identity can remove a claim', async () => {
            await assertClaimsCount(identity, 2, { [Topic.LABEL]: 2 });

            const claimId = getClaimId(anotherIdentity.address, Topic.LABEL);

            // Remove claim using action key
            await assertOkTx(identity.removeClaim(
                claimId,
                { from: accounts.another.addr },
            ));

            // Check claim no longer exists
            await assertRevert(identity.getClaim(claimId));

            // Check ClaimRemoved event
            const logs = await getEvents(identity, {
                event: 'ClaimRemoved',
                args: {
                    topic: new web3.BigNumber(Topic.LABEL),
                    issuer: anotherIdentity.address,
                },
            });
            logs.should.have.a.lengthOf(1);

            await assertClaimsCount(identity, 1, { [Topic.LABEL]: 1 });
        });
    });
});
