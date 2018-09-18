pragma solidity 0.4.24;

import "../ownership/KeyManageable.sol";


/**
 * @title KeyDestructible
 * @author Wu Di
 * @notice Base contract that can be destroyed by MANAGEMENT_KEY or the identity itself
 * @dev Inspired by
 * https://github.com/OpenZeppelin/openzeppelin-solidity/tree/v1.12.0/contracts/lifecycle/Destructible.sol
 */
contract KeyDestructible is KeyManageable {
    /**
     * @dev Transfers the current balance and terminates the contract
     * @param _recipient All funds in contract will be sent to this recipient
     */
    function destroyAndSend(address _recipient)
        public
        onlyManagementOrSelf
    {
        require(_recipient != address(0));
        selfdestruct(_recipient);
    }
}
