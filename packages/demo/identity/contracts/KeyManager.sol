pragma solidity 0.4.24;

import "./ownership/KeyManageable.sol";


/**
 * @title KeyManager
 * @author Wu Di
 * @notice Implement add/remove functions from ERC725 spec
 * Inspired by Mircea Pasoi's implementation at https://github.com/mirceapasoi/erc725-735
 */
contract KeyManager is KeyManageable {
    /**
     * @dev Add key data to the identity if key + purpose tuple doesn't already exist
     * @param _key Key bytes to add
     * @param _purpose Purpose to add
     * @param _keyType Key type to add
     * @return `true` if key was added, `false` if it already exists
     */
    function addKey(bytes32 _key, uint256 _purpose, uint256 _keyType)
        public
        onlyManagementOrSelf
        returns (bool success)
    {
        return executions.addKey(_key, _purpose, _keyType);
    }

    /**
     * @dev Remove key data from the identity
     * @param _key Key bytes to remove
     * @param _purpose Purpose to remove
     * @return `true` if key was found and removed, `false` if it wasn't found
     */
    function removeKey(bytes32 _key, uint256 _purpose)
        public
        onlyManagementOrSelf
        returns (bool success)
    {
        return executions.removeKey(_key, _purpose);
    }
}