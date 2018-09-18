pragma solidity 0.4.24;

import "./lib/ECRecovery.sol";
import "./lifecycle/KeyPausable.sol";
import "./ERC/ERC725.sol";
import "./ERC/ERC735.sol";
import "./ERC/ERC165Query.sol";


/**
 * @title ClaimManager
 * @author Wu Di
 * @notice Implement functions from ERC735 spec
 * Inspired by Mircea Pasoi's implementation at https://github.com/mirceapasoi/erc725-735
 */
contract ClaimManager is KeyPausable, ERC735 {
    using ECRecovery for bytes32;
    using ERC165Query for address;

    bytes constant internal ETH_PREFIX = "\x19Ethereum Signed Message:\n32";

    struct Claim {
        uint256 topic;
        uint256 scheme;
        address issuer; // msg.sender
        bytes signature; // this.address + topic + data
        bytes data;
        string uri;
    }

    mapping(bytes32 => Claim) internal claims;
    mapping(uint256 => bytes32[]) internal claimsByTopic;
    uint public numClaims;

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
        if (_scheme == ECDSA_TYPE) {
            require(_validSignature(_topic, _scheme, _issuer, _signature, _data));
        }
        // Check we can perform action
        bool requireApproval = !_managementOrSelf();

        if (requireApproval) {
            // SHOULD be approved or rejected by n of m approve calls from
            // keys of purpose MANAGEMENT_KEY
            // Execute this function again using its identity
            claimRequestId = this.execute(address(this), 0, msg.data);
            emit ClaimRequested(
                claimRequestId,
                _topic,
                _scheme,
                _issuer,
                _signature,
                _data,
                _uri
            );
            return;
        }

        bytes32 claimId = getClaimId(_issuer, _topic);
        if (claims[claimId].issuer == address(0)) { // New claim
            _addClaim(claimId, _topic, _scheme, _issuer, _signature, _data, _uri);
        } else { // Existing claim
            Claim storage c = claims[claimId];
            c.scheme = _scheme;
            c.signature = _signature;
            c.data = _data;
            c.uri = _uri;
            // You can't change issuer or topic without affecting the claimId,
            // so we don't need to update those two fields
            emit ClaimChanged(
                claimId,
                _topic,
                _scheme,
                _issuer,
                _signature,
                _data,
                _uri
            );
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
        Claim memory c = claims[_claimId];
        // Must exist
        require(c.issuer != address(0));
        // Remove from mapping
        delete claims[_claimId];
        // Remove from type array
        bytes32[] storage topics = claimsByTopic[c.topic];
        for (uint i = 0; i < topics.length; i++) {
            if (topics[i] == _claimId) {
                topics[i] = topics[topics.length - 1];
                delete topics[topics.length - 1];
                topics.length--;
                break;
            }
        }
        // Decrement
        numClaims--;
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
        Claim memory c = claims[_claimId];
        require(c.issuer != address(0));
        topic = c.topic;
        scheme = c.scheme;
        issuer = c.issuer;
        signature = c.signature;
        data = c.data;
        uri = c.uri;
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
        claimIds = claimsByTopic[_topic];
    }

    /**
     * @dev Generate claim ID. Especially useful in tests
     * @param issuer Address of issuer
     * @param topic Claim topic
     * @return Claim ID hash
     */
    function getClaimId(address issuer, uint256 topic)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(issuer, topic));
    }

    /**
     * @dev Generate claim to sign. Especially useful in tests
     * @param subject Address about which we're making a claim
     * @param topic Claim topic
     * @param data Data for the claim
     * @return Hash to be signed by claim issuer
     */
    function claimToSign(address subject, uint256 topic, bytes data)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(subject, topic, data));
    }

    /**
     * @dev Recover address used to sign a claim
     * @param toSign Hash to be signed, potentially generated with `claimToSign`
     * @param signature Signature data i.e. signed hash
     * @return address recovered from `signature` which signed the `toSign` hash
     */
    function getSignatureAddress(bytes32 toSign, bytes signature)
        public
        pure
        returns (address)
    {
        return keccak256(abi.encodePacked(ETH_PREFIX, toSign)).recover(signature);
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
        if (_scheme == ECDSA_TYPE) {
            address signedBy = getSignatureAddress(
                claimToSign(address(this), _topic, _data),
                _signature
            );

            if (_issuer == signedBy) {
                // Issuer signed the signature
                return true;
            } else if (_issuer == address(this)) {
                // Self-signed with CLAIM_SIGNER_KEY
                return allKeys.find(addrToKey(signedBy), CLAIM_SIGNER_KEY);
            } else if (_issuer.doesContractImplementInterface(ERC725ID())) {
                // Issuer is an Identity contract
                // It should hold the key with which the above message was signed.
                // If the key is not present anymore, the claim SHOULD be treated as invalid.
                return ERC725(_issuer).keyHasPurpose(addrToKey(signedBy), CLAIM_SIGNER_KEY);
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
        address issuer = claims[_claimId].issuer;
        // Must exist
        require(issuer != 0);

        // Can perform action on claim
        if (_managementOrSelf()) { // solhint-disable-line no-empty-blocks
            // Valid
        } else if (msg.sender == issuer) { // solhint-disable-line no-empty-blocks
            // MUST only be done by the issuer of the claim
        } else if (issuer.doesContractImplementInterface(ERC725ID())) {
            // Issuer is another Identity contract, is this an action key?
            require(ERC725(issuer).keyHasPurpose(addrToKey(msg.sender), ACTION_KEY));
        } else {
            revert("Sender is NOT Management or Self or Issuer");
        }
        _;
    }

    /**
     * @dev Add key data to the identity without checking if it already exists
     * @param _claimId Claim ID
     * @param _topic Type of claim
     * @param _scheme Scheme used for the signatures
     * @param _issuer Address of issuer
     * @param _signature The actual signature
     * @param _data The data that was signed
     * @param _uri The location of the claim
     */
    function _addClaim(
        bytes32 _claimId,
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes _signature,
        bytes _data,
        string _uri
    )
        internal
    {
        // New claim
        claims[_claimId] = Claim(_topic, _scheme, _issuer, _signature, _data, _uri);
        claimsByTopic[_topic].push(_claimId);
        numClaims++;
        emit ClaimAdded(_claimId, _topic, _scheme, _issuer, _signature, _data, _uri);
    }
}