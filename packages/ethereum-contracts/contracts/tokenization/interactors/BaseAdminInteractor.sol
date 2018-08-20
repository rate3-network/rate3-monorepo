pragma solidity ^0.4.24;

import "../../lib/math/SafeMath.sol";
import "../../lib/ownership/Claimable.sol";
import "../TokenizeTemplateToken.sol";

contract BaseAdminInteractor is Claimable {
    using SafeMath for uint256;

    TokenizedTemplateToken public token;
    address public admin;

    constructor(TokenizedTemplateToken _token) {
        admin = msg.sender;
        token = _token;
    }

    function setToken(TokenizedTemplateToken _newTokenContract) public onlyOwner {
        token = _newTokenContract;
    }

    function setAdmin(address _newAdminAddress) public onlyOwner {
        require(_newAdminAddress != address(0), "Admin cannot be 0x0 address");
        admin = _newAdminAddress;
    }
}

