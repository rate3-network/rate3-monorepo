pragma solidity 0.4.24;

import "../Arrays.sol";
import "../ECRecovery.sol";


/**
 * @title ClaimStore
 * @author Wu Di
 * @notice Library for managing ERC735 claims
 */
library ClaimStore {
    event ClaimAdded(
        bytes32 indexed claimId,
        uint256 indexed topic,
        uint256 scheme,
        address indexed issuer,
        bytes signature,
        bytes data,
        string uri
    );

    event ClaimRemoved(
        bytes32 indexed claimId,
        uint256 indexed topic,
        uint256 scheme,
        address indexed issuer,
        bytes signature,
        bytes data,
        string uri
    );

    event ClaimChanged(
        bytes32 indexed claimId,
        uint256 indexed topic,
        uint256 scheme,
        address indexed issuer,
        bytes signature,
        bytes data,
        string uri
    );

    using ECRecovery for bytes32;
    using Arrays for Arrays.bytes32NoDup;

    bytes constant internal ETH_PREFIX = "\x19Ethereum Signed Message:\n32";

    struct Claim {
        uint256 topic;
        uint256 scheme;
        address issuer; // msg.sender
        bytes signature; // this.address + topic + data
        bytes data;
        string uri;
    }

    struct Claims {
        mapping(bytes32 => Claim) claims;
        mapping(uint256 => Arrays.bytes32NoDup) claimsByTopic;
        uint numClaims;
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
     * @dev Checks whether the claimId exists in the store
     * @param _claimId Claim ID to check
     * @return `true` if the claim is found
     */
    function exists(Claims storage self, bytes32 _claimId)
        public
        view
        returns (bool)
    {
        return self.claims[_claimId].issuer != address(0);
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
     * @return `true` if the claim is a new claim, `false` if it is updated
     */
    function add(
        Claims storage self,
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes _signature,
        bytes _data,
        string _uri
    )
        public
        returns (bytes32 claimId)
    {

        claimId = getClaimId(_issuer, _topic);

        if (exists(self, claimId)) {
            // You can't change issuer or topic without affecting the claimId,
            // so we don't need to update those two fields
            Claim storage c = self.claims[claimId];
            c.scheme = _scheme;
            c.signature = _signature;
            c.data = _data;
            c.uri = _uri;
            emit ClaimChanged(claimId, _topic, _scheme, _issuer, _signature, _data, _uri);

            return claimId;
        } else {
            self.claims[claimId] = Claim(
                _topic,
                _scheme,
                _issuer,
                _signature,
                _data,
                _uri
            );
            self.claimsByTopic[_topic].add(claimId);
            self.numClaims++;
            emit ClaimAdded(claimId, _topic, _scheme, _issuer, _signature, _data, _uri);

            return claimId;
        }
    }

    /**
     * @dev Removes a claim.
     * @param _claimId Claim ID to remove
     * @return `true` if the claim is found and removed
     */
    function remove(Claims storage self, bytes32 _claimId)
        public
        returns (bool success)
    {
        Claim memory c = self.claims[_claimId];
        // Must exist
        if (!exists(self, _claimId)) {
            return false;
        }
        // Remove from mapping
        delete self.claims[_claimId];
        // Remove from type array
        self.claimsByTopic[c.topic].remove(_claimId);
        // Decrement
        self.numClaims--;

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
    function get(Claims storage self, bytes32 _claimId)
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
        require(exists(self, _claimId));
        Claim memory c = self.claims[_claimId];
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
    function getClaimIdsByTopic(Claims storage self, uint256 _topic)
        public
        view
        returns (bytes32[])
    {
        return self.claimsByTopic[_topic].values;
    }
}