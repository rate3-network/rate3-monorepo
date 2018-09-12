pragma solidity 0.4.24;

import "./lifecycle/KeyPausable.sol";


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
        address[] approvals;
    }

    mapping (uint256 => Execution) public execution;

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
        executionId = executionNonce++;
        address[] storage approvals = execution[executionId].approvals;

        uint threshold;
        if (_to == address(this)) {
            threshold = managementThreshold;
            if (msg.sender == address(this)) { // solhint-disable-line no-empty-blocks
                // Contract calling itself to act on itself
            } else {
                // Only management keys can operate on this contract
                require(allKeys.find(addrToKey(msg.sender), MANAGEMENT_KEY));
                approvals.push(msg.sender);
            }
        } else {
            require(_to != address(0));
            threshold = actionThreshold;
            if (msg.sender == address(this)) { // solhint-disable-line no-empty-blocks
                // Contract calling itself to act on other address
            } else {
                // Action keys can operate on other addresses
                require(allKeys.find(addrToKey(msg.sender), ACTION_KEY));
                approvals.push(msg.sender);
            }
        }

        emit ExecutionRequested(executionId, _to, _value, _data);

        Execution memory e = Execution(_to, _value, _data, approvals);
        if (approvals.length >= threshold) { // Threshold reached immediately after 1 approval
            _execute(executionId, e);
        } else {
            execution[executionId] = e;
        }

        return executionId;
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
    function approve(uint256 _id, bool _approve)
        public
        whenNotPaused
        returns (bool success)
    {
        require(_id != 0);
        Execution storage e = execution[_id];
        // Must exist
        require(e.to != address(0));

        uint threshold;
        // Must be approved with the right key
        if (e.to == address(this)) {
            require(allKeys.find(addrToKey(msg.sender), MANAGEMENT_KEY));
            threshold = managementThreshold;
        } else {
            require(allKeys.find(addrToKey(msg.sender), ACTION_KEY));
            threshold = actionThreshold;
        }

        emit Approved(_id, _approve);

        if (!_approve) {
            return _removeApproval(_id, msg.sender);
        } else {
            _addApproval(_id, msg.sender);
            // Do we need more approvals?
            if (e.approvals.length >= threshold) {
                return _execute(_id, e);
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
     * @dev Adds an address from list of approvers
     * @param _id Execution ID
     * @param _approver Address to add
     * @return `true` if added successfully, `false` otherwise
     */
    function _addApproval(uint256 _id, address _approver)
        private
        returns (bool)
    {
        address[] storage approvals = execution[_id].approvals;

        // Only approve once
        for (uint i = 0; i < approvals.length; i++) {
            if (approvals[i] == _approver) {
                return false;
            }
        }

        // Approve
        approvals.push(_approver);
        return true;
    }

    /**
     * @dev Removes an address from list of approvers
     * @param _id Execution ID
     * @param _approver Address to remove
     * @return `true` if removed successfully, `false` otherwise
     */
    function _removeApproval(uint256 _id, address _approver)
        private
        returns (bool)
    {
        address[] storage approvals = execution[_id].approvals;

        // Find in approvals
        for (uint i = 0; i < approvals.length; i++) {
            if (approvals[i] == _approver) {
                // Undo approval
                approvals[i] = approvals[approvals.length - 1];
                delete approvals[approvals.length - 1];
                approvals.length--;
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Executes an action on other contracts, or itself, or a transfer of ether
     * @param _id Execution ID
     * @param e Execution data
     * @return `true` if the execution succeeded, `false` otherwise
     */
    function _execute(uint256 _id, Execution e)
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
        delete execution[_id];
        return true;
    }
}