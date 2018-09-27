pragma solidity ^0.4.24;

import "../../lib/ownership/Claimable.sol";

/**
 * @title Contains admin functions for proxy.
 */
contract AdminProxy is Claimable {

    /// @notice Token address to forward calls to.
    address public token;

    constructor(address _token) public {
        token = _token;
    }

    /**
     * @notice Set the token address to forward calls to.
     * Restricted to onlyOwner.
     * 
     * @param _token Token address.
     */
    function setToken(address _token) public onlyOwner {
        token = _token;
    }
}