pragma solidity 0.4.24;

import "../ERC/ERC725.sol";
import "../lib/KeyStore.sol";
import "../lib/ExecutionStore.sol";


/**
 * @title KeyManageable
 * @author Wu Di
 * @notice Abstract contract for ERC725 implementation
 * @dev Key data is stored using KeyStore library.
 * Inspired by Mircea Pasoi's implementation at https://github.com/mirceapasoi/erc725-735
 */
contract KeyManageable is ERC725 {

    // Key storage
    using KeyStore for KeyStore.Keys;
    using KeyStore for KeyStore.Key;
    using ExecutionStore for ExecutionStore.Executions;
    ExecutionStore.Executions internal executions;

    /**
     * @dev Number of keys managed by the contract
     * @dev Each key can have multiple purposes
     * @return Unsigned integer number of keys
     */
    function numKeys()
        external
        view
        returns (uint)
    {
        return executions.allKeys.numKeys;
    }

    /**
     * @dev Checks if sender is either the identity contract or a MANAGEMENT_KEY
     * @dev If the multi-sig required (threshold > 1), it will throw an error
     * @return `true` if sender is either identity contract or a MANAGEMENT_KEY
     */
    function _managementOrSelf()
        internal
        view
        returns (bool found)
    {
        if (msg.sender == address(this)) {
            // Identity contract itself
            return true;
        }
        // Only works with 1 key threshold, otherwise need multi-sig
        if (executions.managementThreshold == 1) {
            return executions.allKeys.find(
                KeyStore.addrToKey(msg.sender),
                executions.allKeys.enums.MANAGEMENT_KEY()
            );
        }
        return false;
    }

    /**
     * @dev Modifier that only allows keys of purpose MANAGEMENT_KEY,
     *  or the identity itself
     */
    modifier onlyManagementOrSelf {
        require(_managementOrSelf());
        _;
    }
}
