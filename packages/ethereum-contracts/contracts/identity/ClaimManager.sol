pragma solidity 0.4.24;

import "./lifecycle/KeyPausable.sol";
import "./ERC/ERC725.sol";
import "./ERC/ERC735.sol";
import "./lib/ERC165Query.sol";
import "./lib/KeyStore.sol";
import "./lib/ClaimStore.sol";


/**
 * @title ClaimManager
 * @author Wu Di
 * @notice Implement functions from ERC735 spec
 * Inspired by Mircea Pasoi's implementation at https://github.com/mirceapasoi/erc725-735
 */
contract ClaimManager is KeyPausable, ERC735 {
    using ERC165Query for address;

    using ClaimStore for ClaimStore.Claims;
    ClaimStore.Claims internal allClaims;

    function numClaims()
        external
        view
        returns (uint256)
    {
        return allClaims.numClaims;
    }

    /**
     * @dev Requests the ADDITION or the CHANGE of a claim from an issuer.
     *  Claims can requested to be added by anybody, including the claim holder itself (self issued).
     * @param _topic Type of claim
     * @param _scheme Scheme used for the signatures
     * @param _issuer Address of issuer
     * @param _signature The actual signature
     * @param _data The data that was signed
     * @param _uri The location of the claim
     * @return claimRequestId COULD be send to the approve function,
     *  to approve or reject this claim
     */
    function addClaim(
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes _signature,
        bytes _data,
        string _uri
    )
        public
        whenNotPaused
        returns (uint256 claimRequestId)
    {
        // Check signature
        if (_scheme == executions.allKeys.enums.ECDSA_TYPE()) {
            require(_validSignature(_topic, _scheme, _issuer, _signature, _data));
        }
        // Check we can perform action
        bool requireApproval = !_managementOrSelf();

        if (requireApproval) {
            // SHOULD be approved or rejected by n of m approve calls from
            // keys of purpose MANAGEMENT_KEY
            // Execute this function again using its identity
            claimRequestId = this.execute(address(this), 0, msg.data);
            emit ClaimRequested(claimRequestId, _topic, _scheme, _issuer, _signature, _data, _uri);
            return;
        }

        bytes32 claimId;
        bool isNew;
        (claimId, isNew) = allClaims.add(_topic, _scheme, _issuer, _signature, _data, _uri);
        if (isNew) {
            emit ClaimAdded(claimId, _topic, _scheme, _issuer, _signature, _data, _uri);
        } else {
            emit ClaimChanged(claimId, _topic, _scheme, _issuer, _signature, _data, _uri);
        }
    }

    /**
     * @dev Removes a claim. Can only be removed by the claim issuer,
     *  or the claim holder itself.
     * @param _claimId Claim ID to remove
     * @return `true` if the claim is found and removed
     */
    function removeClaim(bytes32 _claimId)
        public
        whenNotPaused
        onlyManagementOrSelfOrIssuer(_claimId)
        returns (bool success)
    {

        ClaimStore.Claim memory c = allClaims.claims[_claimId];
        require(c.issuer != address(0));

        if (allClaims.remove(_claimId)) {
            // Event
            emit ClaimRemoved(
                _claimId,
                c.topic,
                c.scheme,
                c.issuer,
                c.signature,
                c.data,
                c.uri
            );
            return true;
        }
        return false;
    }

    /**
     * @dev Returns a claim by ID
     * @return (topic, scheme, issuer, signature, data, uri) tuple with claim data
     */
    function getClaim(bytes32 _claimId)
        public
        view
        returns (
            uint256 topic,
            uint256 scheme,
            address issuer,
            bytes signature,
            bytes data,
            string uri
        )
    {
        return allClaims.get(_claimId);
    }

    /**
     * @dev Returns claims by type
     * @param _topic Type of claims to return
     * @return array of claim IDs
     */
    function getClaimIdsByTopic(uint256 _topic)
        public
        view
        returns(bytes32[] claimIds)
    {
        return allClaims.getClaimIdsByTopic(_topic);
    }

    /**
     * @dev Only possible to verify for ECDSA that's built into Ethereum
     * @dev Checks if a given claim is valid:
     *  - claim is signed by issuer directly
     *  - claim is self-signed with a valid CLAIM_SIGNER_KEY
     *  - claim is signed by another identity contract's valid CLAIM_SIGNER_KEY
     * @param _topic Type of claim
     * @param _scheme Scheme used for the signatures
     * @param _issuer Address of issuer
     * @param _signature The actual signature
     * @param _data The data that was signed
     * @return `false` if the signature is invalid or if the scheme is not implemented
     */
    function _validSignature(
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes _signature,
        bytes _data
    )
        internal
        view
        returns (bool)
    {
        if (_scheme == executions.allKeys.enums.ECDSA_TYPE()) {
            address signedBy = ClaimStore.getSignatureAddress(
                ClaimStore.claimToSign(address(this), _topic, _data),
                _signature
            );

            if (_issuer == signedBy) {
                // Issuer signed the signature
                return true;
            } else if (_issuer == address(this)) {
                // Self-signed with CLAIM_SIGNER_KEY
                return executions.allKeys.find(
                    KeyStore.addrToKey(signedBy),
                    executions.allKeys.enums.CLAIM_SIGNER_KEY()
                );
            } else if (_issuer.doesContractImplementInterface(ERC725ID())) {
                // Issuer is an Identity contract
                // It should hold the key with which the above message was signed.
                // If the key is not present anymore, the claim SHOULD be treated as invalid.
                return ERC725(_issuer).keyHasPurpose(
                    KeyStore.addrToKey(signedBy),
                    executions.allKeys.enums.CLAIM_SIGNER_KEY()
                );
            }
            // Invalid
            return false;
        } else {
            // Not implemented
            return false;
        }
    }

    /**
     * @dev Modifier that only allows keys of purpose MANAGEMENT_KEY,
     *  the identity itself, or the issuer or the claim
     */
    modifier onlyManagementOrSelfOrIssuer(bytes32 _claimId) {
        address issuer;
        (, , issuer, , ,) = allClaims.get(_claimId);
        // Must exist
        require(issuer != 0);

        // Can perform action on claim
        if (_managementOrSelf()) { // solhint-disable-line no-empty-blocks
            // Valid
        } else if (msg.sender == issuer) { // solhint-disable-line no-empty-blocks
            // MUST only be done by the issuer of the claim
        } else if (issuer.doesContractImplementInterface(ERC725ID())) {
            // Issuer is another Identity contract, is this an action key?
            require(ERC725(issuer).keyHasPurpose(
                KeyStore.addrToKey(msg.sender),
                executions.allKeys.enums.ACTION_KEY()
            ));
        } else {
            revert("Sender is NOT Management or Self or Issuer");
        }
        _;
    }
}