pragma solidity 0.4.24;

import "./lifecycle/KeyPausable.sol";
import "./ERC/ERC725.sol";


/**
 * @title MultiSig
 * @author Wu Di
 * @notice Implement execute and multi-sig functions from ERC725 spec
 * Inspired by Mircea Pasoi's implementation at https://github.com/mirceapasoi/erc725-735
 */
contract MultiSig is KeyPausable {

    event ExecutionFailed(
        uint256 indexed executionId,
        address indexed to,
        uint256 indexed value,
        bytes data
    );

    // To prevent replay attacks
    uint256 private executionNonce = 1;

    struct Execution {
        address to;
        uint256 value;
        bytes data;
        uint256 needsApprove;
    }

    mapping (uint256 => Execution) public execution;
    mapping (uint256 => address[]) public approved;

    /**
     * @dev Generate a unique ID for an execution request
     * @param _to address being called (msg.sender)
     * @param _value ether being sent (msg.value)
     * @param _data ABI encoded call data (msg.data)
     */
    function execute(address _to, uint256 _value, bytes _data)
        public
        whenNotPaused
        returns (uint256 executionId)
    {
        bool senderApproved = false;
        uint threshold;
        if (_to == address(this)) {
            if (msg.sender == address(this)) {
                // Contract calling itself to act on itself
                threshold = managementThreshold;
            } else {
                // Only management keys can operate on this contract
                require(allKeys.find(addrToKey(msg.sender), MANAGEMENT_KEY));
                threshold = managementThreshold - 1;
                senderApproved = true;
            }
        } else {
            require(_to != address(0));
            if (msg.sender == address(this)) {
                // Contract calling itself to act on other address
                threshold = actionThreshold;
            } else {
                // Action keys can operate on other addresses
                require(allKeys.find(addrToKey(msg.sender), ACTION_KEY));
                threshold = actionThreshold - 1;
                senderApproved = true;
            }
        }

        executionId = executionNonce++;
        emit ExecutionRequested(executionId, _to, _value, _data);

        Execution memory e = Execution(_to, _value, _data, threshold);
        if (threshold == 0) { // Threshold reached immediately after 1 approval
            _execute(executionId, e, false);
        } else {
            execution[executionId] = e;
            delete approved[executionId];
            if (senderApproved) {
                approved[executionId].push(msg.sender);
            }
        }

        return executionId;
    }

    /**
     * @dev Approves an execution.
     *  If the execution is being approved multiple times, it will throw an
     *  error.
     *  Disapproving multiple times will work i.e. not do anything.
     *  The approval could potentially trigger an execution (if the threshold is met).
     * @param _id Execution ID
     * @param _approve `true` if it's an approval, `false` if it's a disapproval
     * @return `false` if it's a disapproval and there's no previous approval from the sender OR
     *  if it's an approval that triggered a failed execution. `true` if it's a disapproval that
     *  undos a previous approval from the sender OR if it's an approval that succeded OR
     *  if it's an approval that triggered a succesful execution
     */
    function approve(uint256 _id, bool _approve)
        public
        whenNotPaused
        returns (bool success)
    {
        require(_id != 0);
        Execution storage e = execution[_id];
        // Must exist
        require(e.to != address(0));

        // Must be approved with the right key
        if (e.to == address(this)) {
            require(allKeys.find(addrToKey(msg.sender), MANAGEMENT_KEY));
        } else {
            require(allKeys.find(addrToKey(msg.sender), ACTION_KEY));
        }

        emit Approved(_id, _approve);

        address[] storage approvals = approved[_id];
        if (!_approve) {
            // Find in approvals
            for (uint i = 0; i < approvals.length; i++) {
                if (approvals[i] == msg.sender) {
                    // Undo approval
                    approvals[i] = approvals[approvals.length - 1];
                    delete approvals[approvals.length - 1];
                    approvals.length--;
                    e.needsApprove += 1;
                    return true;
                }
            }
            return false;
        } else {
            // Only approve once
            for (i = 0; i < approvals.length; i++) {
                require(approvals[i] != msg.sender);
            }

            // Approve
            approvals.push(msg.sender);
            e.needsApprove -= 1;

            // Do we need more approvals?
            if (e.needsApprove == 0) {
                return _execute(_id, e, true);
            }
            return true;
        }
    }

    /**
     * @dev Change multi-sig threshold for MANAGEMENT_KEY
     * @param threshold New threshold to change it to (will throw if 0 or
     *  larger than available keys)
     */
    function changeManagementThreshold(uint threshold)
        public
        whenNotPaused
        onlyManagementOrSelf
    {
        require(threshold > 0);
        // Don't lock yourself out
        uint numManagementKeys = getKeysByPurpose(MANAGEMENT_KEY).length;
        require(threshold <= numManagementKeys);
        managementThreshold = threshold;
    }

    /**
     * @dev Change multi-sig threshold for ACTION_KEY
     * @param threshold New threshold to change it to (will throw if 0 or
     *  larger than available keys)
     */
    function changeActionThreshold(uint threshold)
        public
        whenNotPaused
        onlyManagementOrSelf
    {
        require(threshold > 0);
        // Don't lock yourself out
        uint numActionKeys = getKeysByPurpose(ACTION_KEY).length;
        require(threshold <= numActionKeys);
        actionThreshold = threshold;
    }

    /**
     * @dev Executes an action on other contracts, or itself, or a transfer of ether
     * @param _id Execution ID
     * @param e Execution data
     * @param clean `true` if the internal state should be cleaned up after the execution
     * @return `true` if the execution succeeded, `false` otherwise
     */
    function _execute(uint256 _id, Execution e, bool clean)
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
        // Clean up
        if (!clean) {
            return true;
        }
        delete execution[_id];
        delete approved[_id];
        return true;
    }
}