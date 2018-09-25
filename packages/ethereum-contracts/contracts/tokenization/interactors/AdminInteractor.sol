pragma solidity ^0.4.24;

import "../../lib/math/SafeMath.sol";
import "../../lib/ownership/Claimable.sol";
import "../shared/TokenInterface.sol";
import "../shared/ProxySupportedERC20Interface.sol";
import "../shared/ProxyInterface.sol";

contract AdminInteractor is Claimable {
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

    function setTokenOnProxy(Ownable _token) public onlyOwner {
        require(Ownable(_token).owner() == address(this), "Interactor not owner of token");
        ProxyInterface(proxy).setToken(_token);
    }

    function setProxyOnToken(Ownable _proxy) public onlyOwner {
        require(Ownable(_proxy).owner() == address(this), "Interactor not owner of proxy");
        ProxySupportedERC20Interface(token).setProxy(_proxy);
    }

    function transferOwnedContract(
        Ownable _ownedContract,
        address _newOwner
    )
        public
        onlyOwner
    {
        _ownedContract.transferOwnership(_newOwner);
    }

    function claimContractFromToken(Claimable _contractAddress) public onlyOwner {
        TokenInterface(token).transferContractOwnership(_contractAddress);
        Claimable(_contractAddress).claimOwnership();
    }

    function setBalanceModule(address _moduleAddress) public onlyOwner returns (bool) {
        return TokenInterface(token).setBalanceModule(_moduleAddress);
    }

    function setAllowanceModule(address _moduleAddress) public onlyOwner returns (bool) {
        return TokenInterface(token).setAllowanceModule(_moduleAddress);
    }

    function setRegistryModule(address _moduleAddress) public onlyOwner returns (bool) {
        return TokenInterface(token).setRegistryModule(_moduleAddress);
    }
}

