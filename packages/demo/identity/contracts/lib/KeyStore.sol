pragma solidity 0.4.24;

import "../Arrays.sol";


/**
 * @title KeyStore
 * @author Wu Di
 * @notice Library for managing ERC725 keys
 * Inspired by Mircea Pasoi's implementation at https://github.com/mirceapasoi/erc725-735
 */
library KeyStore {

    using Arrays for Arrays.uint256NoDup;
    using Arrays for Arrays.bytes32NoDup;

    struct Key {
        // MANAGEMENT_KEY = 1, ACTION_KEY = 2, SIGN_KEY = 3, ENCRYPTION_KEY = 4
        Arrays.uint256NoDup purposes;
        // ECDSA = 1, RSA = 2
        uint256 keyType;
        // for non-hex and long keys, its the Keccak256 hash of the key
        bytes32 key;
    }

    /**
     * @dev Check for purpose in key
     * @param purpose Purpose to check for
     */
    function hasPurpose(Key storage self, uint256 purpose)
        internal
        view
        returns (bool exists)
    {
        return self.purposes.contains(purpose);
    }

    struct Keys {
        mapping (bytes32 => Key) keyData;
        mapping (uint256 => Arrays.bytes32NoDup) keysByPurpose;
        uint numKeys;
    }

    /**
     * @dev Find a key + purpose tuple
     * @param key Key bytes to find
     * @param purpose Purpose to find
     * @return `true` if key + purpose tuple if found
     */
    function find(Keys storage self, bytes32 key, uint256 purpose)
        internal
        view
        returns (bool found)
    {
        Key storage k = self.keyData[key];
        if (k.key == 0) {
            return false;
        }
        return hasPurpose(k, purpose);
    }

    /**
     * @dev Add a Key
     * @param key Key bytes to add
     * @param purpose Purpose to add, will append to purposes if key exists
     * @param keyType Key type to add, will only be set if key does not exist
     */
    function add(Keys storage self, bytes32 key, uint256 purpose, uint256 keyType)
        internal
    {
        Key storage k = self.keyData[key];
        if (k.key == 0) {
            k.key = key;
            k.keyType = keyType;
            self.numKeys++;
        } else {
            require(k.keyType == keyType, "Key exists, conflicting key type");
        }
        if (!hasPurpose(k, purpose)) {
            k.purposes.add(purpose);
            self.keysByPurpose[purpose].add(key);
        }
    }

    /**
     * @dev Remove Key
     * @param key Key bytes to remove
     * @param purpose Purpose to remove
     * @return Key type of the key that was removed
     */
    function remove(Keys storage self, bytes32 key, uint256 purpose)
        internal
        returns (uint256 keyType)
    {
        Key storage k = self.keyData[key];

        require(hasPurpose(k, purpose), "Key does not have purpose");

        keyType = k.keyType;
        k.purposes.remove(purpose);

        // No more purposes
        if (self.keyData[key].purposes.values.length == 0) {
            delete self.keyData[key];
            self.numKeys--;
        }

        // Delete key from keysByPurpose
        self.keysByPurpose[purpose].remove(key);
    }
}