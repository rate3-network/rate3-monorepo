pragma solidity 0.4.24;


/**
 * @title Arrays
 * @author Wu Di
 * @notice Library for arrays
 */
library Arrays {
    // solhint-disable-next-line contract-name-camelcase
    struct uint256NoDup {
        uint256[] values;
        mapping (uint256 => uint256) valueIdx;
    }

    /**
     * @dev Check for value in array
     * @param value Value to check for
     */
    function contains(uint256NoDup storage self, uint256 value)
        public
        view
        returns (bool exists)
    {
        if (self.values.length == 0) {
            return false;
        } else if (self.valueIdx[value] > 0) {
            return true;
        } else if (self.values[0] == value) {
            return true;
        }
        return false;
    }

    /**
     * @dev Add a value
     * @param value Value to add
     */
    function add(uint256NoDup storage self, uint256 value)
        public
    {
        require(!contains(self, value));
        uint256 idx = self.values.push(value) - 1;
        self.valueIdx[value] = idx;
    }

    /**
     * @dev Remove value
     * @param value Value to remove
     */
    function remove(uint256NoDup storage self, uint256 value)
        public
    {
        require(contains(self, value));
        uint256 idx = self.valueIdx[value];
        self.values[idx] = self.values[self.values.length - 1];
        self.valueIdx[self.values[idx]] = idx;
        delete self.values[self.values.length - 1];
        self.values.length--;
    }

    // solhint-disable-next-line contract-name-camelcase
    struct bytes32NoDup {
        bytes32[] values;
        mapping (bytes32 => uint256) valueIdx;
    }

    /**
     * @dev Check for value in array
     * @param value Value to check for
     */
    function contains(bytes32NoDup storage self, bytes32 value)
        public
        view
        returns (bool exists)
    {
        if (self.values.length == 0) {
            return false;
        } else if (self.valueIdx[value] > 0) {
            return true;
        } else if (self.values[0] == value) {
            return true;
        }
        return false;
    }

    /**
     * @dev Add a value
     * @param value Value to add
     */
    function add(bytes32NoDup storage self, bytes32 value)
        public
    {
        require(!contains(self, value));
        uint256 idx = self.values.push(value) - 1;
        self.valueIdx[value] = idx;
    }

    /**
     * @dev Remove value
     * @param value Value to remove
     */
    function remove(bytes32NoDup storage self, bytes32 value)
        public
    {
        require(contains(self, value));
        uint256 idx = self.valueIdx[value];
        self.values[idx] = self.values[self.values.length - 1];
        self.valueIdx[self.values[idx]] = idx;
        delete self.values[self.values.length - 1];
        self.values.length--;
    }
}
