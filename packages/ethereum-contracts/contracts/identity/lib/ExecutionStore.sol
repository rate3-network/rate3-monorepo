pragma solidity 0.4.24;

import "../../lib/Arrays.sol";
import "./KeyStore.sol";


/**
 * @title ExecutionStore
 * @author Wu Di
 * @notice Library for managing Executions
 */
library ExecutionStore {

    event KeyAdded(
        bytes32 indexed key,
        uint256 indexed purpose,
        uint256 indexed keyType
    );

    event KeyRemoved(
        bytes32 indexed key,
        uint256 indexed purpose,
        uint256 indexed keyType
    );

    event ExecutionRequested(
        uint256 indexed executionId,
        address indexed to,
        uint256 indexed value,
        bytes data
    );

    event Executed(
        uint256 indexed executionId,
        address indexed to,
        uint256 indexed value,
        bytes data
    );

    event ExecutionFailed(
        uint256 indexed executionId,
        address indexed to,
        uint256 indexed value,
        bytes data
    );

    event Approved(uint256 indexed executionId, bool approved);

    using Arrays for Arrays.bytes32NoDup;
    using KeyStore for KeyStore.Keys;
    using KeyStore for KeyStore.Key;

    struct Execution {
        address to;
        uint256 value;
        bytes data;
        Arrays.bytes32NoDup approvals;
    }

    /**
     * @dev Adds an address to list of approvals
     * @param addr Address to add
     * @return `true` if added
     */
    function addApproval(Execution storage self, address addr)
        public
        returns (bool)
    {
        bytes32 approvalAddr = KeyStore.addrToKey(addr);
        if (self.approvals.contains(approvalAddr)) {
            return false;
        }
        self.approvals.add(approvalAddr);
        return true;
    }

    /**
     * @dev Removes an address to list of approvals
     * @param addr Address to remove
     * @return `true` if removed
     */
    function removeApproval(Execution storage self, address addr)
        public
        returns (bool)
    {
        bytes32 approvalAddr = KeyStore.addrToKey(addr);
        if (!self.approvals.contains(approvalAddr)) {
            return false;
        }
        self.approvals.remove(approvalAddr);
        return true;
    }

    struct Executions {
        KeyStore.Keys allKeys;
        uint256 managementThreshold;
        uint256 actionThreshold;
        uint256 nonce;
        mapping (uint256 => Execution) execution;
    }

     /**
     * @dev Remove Key
     * @param key Key bytes to remove
     * @param purpose Purpose to remove
     * @return Key type of the key that was removed
     */
    function removeKey(Executions storage self, bytes32 key, uint256 purpose)
        public
        returns (bool)
    {
        if (!self.allKeys.find(key, purpose)) {
            return false;
        }
        if (purpose == self.allKeys.enums.MANAGEMENT_KEY()) {
            require(
                self.allKeys.keysByPurpose[purpose].values.length - 1 >= self.managementThreshold,
                "Number of keys below threshold"
            );
        } else if (purpose == self.allKeys.enums.ACTION_KEY()) {
            require(
                self.allKeys.keysByPurpose[purpose].values.length - 1 >= self.actionThreshold,
                "Number of keys below threshold"
            );
        }
        uint256 keyType = self.allKeys.remove(key, purpose);
        emit KeyRemoved(key, purpose, keyType);
        return true;
    }

    /**
     * @dev Add key data to the identity if key + purpose tuple doesn't already exist
     * @param _key Key bytes to add
     * @param _purpose Purpose to add
     * @param _keyType Key type to add
     * @return `true` if key was added, `false` if it already exists
     */
    function addKey(Executions storage self, bytes32 _key, uint256 _purpose, uint256 _keyType)
        public
        returns (bool success)
    {
        success = self.allKeys.add(_key, _purpose, _keyType);
        if (success) {
            emit KeyAdded(_key, _purpose, _keyType);
        }
    }

    /**
     * @dev Generate a unique ID for an execution request
     * @param _to address being called (msg.sender)
     * @param _value ether being sent (msg.value)
     * @param _data ABI encoded call data (msg.data)
     */
    function add(Executions storage self, address _to, uint256 _value, bytes _data)
        public
        returns (uint256 executionId)
    {
        executionId = ++self.nonce;
        Arrays.bytes32NoDup storage approvals = self.execution[executionId].approvals;

        uint threshold;
        bytes32 approvalAddr = KeyStore.addrToKey(msg.sender);
        if (_to == address(this)) {
            threshold = self.managementThreshold;
            if (msg.sender == address(this)) { // solhint-disable-line no-empty-blocks
                // Contract calling itself to act on itself
            } else {
                // Only management keys can operate on this contract
                require(
                    self.allKeys.find(
                        approvalAddr,
                        self.allKeys.enums.MANAGEMENT_KEY()
                    )
                );
                approvals.add(approvalAddr);
            }
        } else {
            require(_to != address(0));
            threshold = self.actionThreshold;
            if (msg.sender == address(this)) { // solhint-disable-line no-empty-blocks
                // Contract calling itself to act on other address
            } else {
                // Action keys can operate on other addresses
                require(
                    self.allKeys.find(
                        approvalAddr,
                        self.allKeys.enums.ACTION_KEY()
                    )
                );
                approvals.add(approvalAddr);
            }
        }

        emit ExecutionRequested(executionId, _to, _value, _data);

        Execution memory e = Execution(_to, _value, _data, approvals);
        if (approvals.values.length >= threshold) {
            _execute(self, executionId, e);
        } else {
            self.execution[executionId] = e;
        }
    }

    /**
     * @dev Approves an execution.
     *  Approving multiple times will work i.e. used to trigger an execution if
     *  it failed the first time.
     *  Disapproving multiple times will work i.e. not do anything.
     *  The approval could potentially trigger an execution (if the threshold is met).
     * @param _id Execution ID
     * @param _approve `true` if it's an approval, `false` if it's a disapproval
     * @return `false` if it's a disapproval and there's no previous approval from the sender OR
     *  if it's an approval that triggered a failed execution. `true` if it's a disapproval that
     *  undos a previous approval from the sender OR if it's an approval that succeeded OR
     *  if it's an approval that triggered a successful execution
     */
    function approve(Executions storage self, uint256 _id, bool _approve)
        public
        returns (bool success)
    {
        require(_id != 0);
        Execution storage e = self.execution[_id];
        // Must exist
        require(e.to != address(0));

        uint threshold;
        bytes32 approvalAddr = KeyStore.addrToKey(msg.sender);
        // Must be approved with the right key
        if (e.to == address(this)) {
            require(
                self.allKeys.find(
                    approvalAddr,
                    self.allKeys.enums.MANAGEMENT_KEY()
                )
            );
            threshold = self.managementThreshold;
        } else {
            require(
                self.allKeys.find(
                    approvalAddr,
                    self.allKeys.enums.ACTION_KEY()
                )
            );
            threshold = self.actionThreshold;
        }

        emit Approved(_id, _approve);

        if (!_approve) {
            return removeApproval(e, msg.sender);
        } else {
            addApproval(e, msg.sender);
            // Do we need more approvals?
            if (e.approvals.values.length >= threshold) {
                return _execute(self, _id, e);
            }
            return true;
        }
    }

    /**
     * @dev Change multi-sig threshold for MANAGEMENT_KEY
     * @param threshold New threshold to change it to (will throw if 0 or
     *  larger than available keys)
     */
    function changeManagementThreshold(Executions storage self, uint threshold)
        public
    {
        require(threshold > 0);
        // Don't lock yourself out
        uint256 _purpose = self.allKeys.enums.MANAGEMENT_KEY();
        require(threshold <= self.allKeys.keysByPurpose[_purpose].values.length);
        self.managementThreshold = threshold;
    }

    /**
     * @dev Change multi-sig threshold for ACTION_KEY
     * @param threshold New threshold to change it to (will throw if 0 or
     *  larger than available keys)
     */
    function changeActionThreshold(Executions storage self, uint threshold)
        public
    {
        require(threshold > 0);
        // Don't lock yourself out
        uint256 _purpose = self.allKeys.enums.ACTION_KEY();
        require(threshold <= self.allKeys.keysByPurpose[_purpose].values.length);
        self.actionThreshold = threshold;
    }

    /**
     * @dev Executes an action on other contracts, or itself, or a transfer of ether
     * @param _id Execution ID
     * @param e Execution data
     * @return `true` if the execution succeeded, `false` otherwise
     */
    function _execute(Executions storage self, uint256 _id, Execution e)
        private
        returns (bool)
    {
        // Must exist
        require(e.to != 0);
        // solhint-disable-next-line avoid-call-value
        bool success = e.to.call.value(e.value)(e.data);
        if (!success) {
            emit ExecutionFailed(_id, e.to, e.value, e.data);
            return false;
        }
        emit Executed(_id, e.to, e.value, e.data);
        delete self.execution[_id];
        return true;
    }
}
