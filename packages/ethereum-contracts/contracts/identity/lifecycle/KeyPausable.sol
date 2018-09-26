pragma solidity 0.4.24;

import "../ownership/KeyManageable.sol";


/**
 * @title KeyPausable
 * @author Wu Di
 * @notice Base contract which allows children to implement an emergency stop mechanism
 * @dev Inspired by https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/lifecycle/Pausable.sol
 */
contract KeyPausable is KeyManageable {
    event Paused();
    event Unpaused();

    bool public _paused = false;

    /**
     * @return true if the contract is paused, false otherwise.
     */
    function isPaused() public view returns(bool) {
        return _paused;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     */
    modifier whenNotPaused() {
        require(!_paused, "Contract is paused");
        _;
    }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
    modifier whenPaused() {
        require(_paused, "Contract is not paused");
        _;
    }

    /**
    * @dev called by the owner to pause, triggers stopped state
    */
    function pause() public onlyManagementOrSelf whenNotPaused {
        _paused = true;
        emit Paused();
    }

    /**
    * @dev called by the owner to unpause, returns to normal state
    */
    function unpause() public onlyManagementOrSelf whenPaused {
        _paused = false;
        emit Unpaused();
    }
}
