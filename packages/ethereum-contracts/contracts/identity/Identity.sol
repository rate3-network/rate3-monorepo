pragma solidity 0.4.24;

import "./lifecycle/KeyDestructible.sol";
import "./KeyGetters.sol";
import "./KeyManager.sol";
import "./MultiSig.sol";
import "./ClaimManager.sol";
import "./constants/KeyEnums.sol";
import "./lib/KeyStore.sol";


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
     * @param _keyEnums Key constants contract
     */
    constructor(address _identityOwner, KeyEnums _keyEnums) public {
        executions.allKeys.enums = _keyEnums;
        executions.managementThreshold = 1;
        executions.actionThreshold = 1;
        bytes32 ownerKey = KeyStore.addrToKey(_identityOwner);
        // Add key that deployed the contract for MANAGEMENT, ACTION, CLAIM
        executions.addKey(ownerKey, _keyEnums.MANAGEMENT_KEY(), _keyEnums.ECDSA_TYPE());
        executions.addKey(ownerKey, _keyEnums.ACTION_KEY(), _keyEnums.ECDSA_TYPE());
        executions.addKey(ownerKey, _keyEnums.CLAIM_SIGNER_KEY(), _keyEnums.ECDSA_TYPE());

        // Supports both ERC 725 & 735
        // ERC725ID ^ ERC735ID
        supportedInterfaces[0x6a89c416] = true;
    }

    // Fallback function accepts Ether transactions
    // solhint-disable-next-line no-empty-blocks
    function() external payable {
    }
}