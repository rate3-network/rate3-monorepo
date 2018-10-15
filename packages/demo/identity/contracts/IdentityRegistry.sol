pragma solidity 0.4.24;

import "./Identity.sol";
import "./constants/KeyEnums.sol";


/**
 * @title IdentityRegistry
 * @author Wu Di
 * @notice Implement registry of Identity
 */
contract IdentityRegistry {

    event NewIdentity(address senderAddress, address identityAddress);

    KeyEnums private keyEnums;

    constructor(KeyEnums _keyEnums) public {
        keyEnums = _keyEnums;
    }

    // Mapping from ethereum wallet to ERC725 + ERC735 identity
    mapping(address => address) public identities;

    /**
     * @dev Creates a new identity and adds it to the registry
     */
    function createIdentity()
        external
        returns (address)
    {
        require(identities[msg.sender] == address(0), "Identity exists");
        Identity newIdentity = new Identity(msg.sender, keyEnums);
        identities[msg.sender] = newIdentity;
        emit NewIdentity(msg.sender, newIdentity);

        return newIdentity;
    }

    /**
     * @dev Checks whether an identity exists in the registry
     */
    function hasIdentity(address addr)
        public
        view
        returns (bool)
    {
        return identities[addr] != address(0);
    }
}
