pragma solidity 0.4.24;

import "./lifecycle/KeyDestructible.sol";
import "./KeyGetters.sol";
import "./KeyManager.sol";
import "./MultiSig.sol";
import "./ClaimManager.sol";


/**
 * @title Identity
 * @author Wu Di
 * @notice Identity contract implementing both ERC725 and ERC735
 */
contract Identity is KeyManager, MultiSig, ClaimManager, KeyGetters, KeyDestructible {
    /**
     * @dev Constructor for Identity contract. The initial owner address
     *  will be set as the MANAGEMENT_KEY, ACTION_KEY and CLAIM_SIGNER_KEY
     * @param _identityOwner Address of the identity owner
     */
    constructor(address _identityOwner) public {
        bytes32 ownerKey = addrToKey(_identityOwner);
        // Add key that deployed the contract for MANAGEMENT, ACTION, CLAIM
        _addKey(ownerKey, MANAGEMENT_KEY, ECDSA_TYPE);
        _addKey(ownerKey, ACTION_KEY, ECDSA_TYPE);
        _addKey(ownerKey, CLAIM_SIGNER_KEY, ECDSA_TYPE);
        actionThreshold = 1;
        managementThreshold = 1;

        // Supports both ERC 725 & 735
        supportedInterfaces[ERC725ID() ^ ERC735ID()] = true;
    }

    // Fallback function accepts Ether transactions
    // solhint-disable-next-line no-empty-blocks
    function() external payable {
    }
}