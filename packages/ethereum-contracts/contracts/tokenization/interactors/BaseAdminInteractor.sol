pragma solidity ^0.4.24;

import "../../lib/math/SafeMath.sol";
import "../../lib/ownership/Claimable.sol";
import "../TokenizeTemplateToken.sol";

contract BaseAdminInteractor is Claimable {
    using SafeMath for uint256;

    TokenizeTemplateToken public token;
    address public admin1;
    address public admin2;

    modifier onlyAdmin1() {
        require(msg.sender == admin1, "Only allowed for Admin1");
        _;
    }

    modifier onlyAdmin2() {
        require(msg.sender == admin2, "Only allowed for Admin2");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin1 || msg.sender == admin2, "Only allowed for Admins");
        _;
    }

    constructor(TokenizeTemplateToken _token) {
        admin1 = msg.sender;
        admin2 = msg.sender;
        token = _token;
    }

    function setToken(TokenizeTemplateToken _newTokenContract) public onlyOwner {
        token = _newTokenContract;
    }

    function setFirstAdmin(address _newAdminAddress) public onlyOwner {
        require(_newAdminAddress != address(0), "Admin cannot be 0x0 address");
        admin1 = _newAdminAddress;
    }

    function setSecondAdmin(address _newAdminAddress) public onlyOwner {
        require(_newAdminAddress != address(0), "Admin cannot be 0x0 address");
        admin2 = _newAdminAddress;
    }

    function claimTokenOwnership(TokenizeTemplateToken _newTokenContract) public onlyOwner {
        token.claimOwnership();
    }
}

