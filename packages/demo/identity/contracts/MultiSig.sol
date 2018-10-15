pragma solidity 0.4.24;

import "./ownership/KeyManageable.sol";


/**
 * @title MultiSig
 * @author Wu Di
 * @notice Implement execute and multi-sig functions from ERC725 spec
 * Inspired by Mircea Pasoi's implementation at https://github.com/mirceapasoi/erc725-735
 */
contract MultiSig is KeyManageable {

    event ExecutionFailed(
        uint256 indexed executionId,
        address indexed to,
        uint256 indexed value,
        bytes data
    );

    /**
     * @dev Generate a unique ID for an execution request
     * @param _to address being called (msg.sender)
     * @param _value ether being sent (msg.value)
     * @param _data ABI encoded call data (msg.data)
     */
    function execute(address _to, uint256 _value, bytes _data)
        public
        returns (uint256 executionId)
    {
        return executions.add(_to, _value, _data);
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
        returns (bool success)
    {
        return executions.approve(_id, _approve);
    }

    /**
     * @dev Change multi-sig threshold for MANAGEMENT_KEY
     * @param threshold New threshold to change it to (will throw if 0 or
     *  larger than available keys)
     */
    function changeManagementThreshold(uint threshold)
        public
        onlyManagementOrSelf
    {
        executions.changeManagementThreshold(threshold);
    }

    /**
     * @dev Change multi-sig threshold for ACTION_KEY
     * @param threshold New threshold to change it to (will throw if 0 or
     *  larger than available keys)
     */
    function changeActionThreshold(uint threshold)
        public
        onlyManagementOrSelf
    {
        executions.changeActionThreshold(threshold);
    }
}