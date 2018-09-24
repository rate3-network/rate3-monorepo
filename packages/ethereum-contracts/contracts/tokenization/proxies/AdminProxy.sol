pragma solidity ^0.4.24;

import "../../lib/ownership/Claimable.sol";

contract AdminProxy is Claimable {

    address public token;

    constructor(address _token) public {
        token = _token;
    }

    function setToken(address _token) public onlyOwner {
        token = _token;
    }
}