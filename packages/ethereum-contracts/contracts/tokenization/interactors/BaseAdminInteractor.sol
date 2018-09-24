pragma solidity ^0.4.24;

import "../../lib/math/SafeMath.sol";
import "../../lib/ownership/Claimable.sol";

contract BaseAdminInteractor is Claimable {
    using SafeMath for uint256;

    address public token;
    address public proxy;
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

    constructor(address _token, address _proxy) public {
        admin1 = msg.sender;
        admin2 = msg.sender;
        token = _token;
        proxy = _proxy;
    }

    function setToken(address _newTokenContract) public onlyOwner {
        token = _newTokenContract;
    }

    function claimTokenOwnership() public onlyOwner {
        Claimable(token).claimOwnership();
    }

    function setProxy(address _newProxyContract) public onlyOwner {
        proxy = _newProxyContract;
    }

    function claimProxyOwnership() public onlyOwner {
        Claimable(proxy).claimOwnership();
    }

    function setFirstAdmin(address _newAdminAddress) public onlyOwner {
        require(_newAdminAddress != address(0), "Admin cannot be 0x0 address");
        admin1 = _newAdminAddress;
    }

    function setSecondAdmin(address _newAdminAddress) public onlyOwner {
        require(_newAdminAddress != address(0), "Admin cannot be 0x0 address");
        admin2 = _newAdminAddress;
    }
}

