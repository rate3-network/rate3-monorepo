pragma solidity ^0.4.24;

import "../../lib/ownership/Claimable.sol";
import "../shared/TokenInterface.sol";
import "../shared/ProxySupportedERC20Interface.sol";
import "../shared/ProxyInterface.sol";

/**
 * @title Contains admin functions for interactor.
 *
 * @notice
 * - Set token and proxy contracts
 * - Set admins for operations
 * - Manage contracts owned by the interactor contract 
 */
contract AdminInteractor is Claimable {
    /// @notice Token contract address.
    address public token;

    /// @notice Token Proxy contract address.
    address public proxy;

    /// @notice Appointed first admin address.
    address public admin1;

    /// @notice Appointed second admin address.
    address public admin2;

    /// @notice Allow only if Admin 1 is sending the transaction.
    modifier onlyAdmin1() {
        require(msg.sender == admin1, "Only allowed for Admin1");
        _;
    }

    /// @notice Allow only if Admin 2 is sending the transaction.
    modifier onlyAdmin2() {
        require(msg.sender == admin2, "Only allowed for Admin2");
        _;
    }

    /// @notice Allow both Admin 1 and Admin 2.
    modifier onlyAdmin() {
        require(msg.sender == admin1 || msg.sender == admin2, "Only allowed for Admins");
        _;
    }

    /**
     * @notice Constructor for AdminInteractor.
     *
     * @param _token Token contract address.
     * @param _proxy Proxy contract address.
     */
    constructor(address _token, address _proxy) public {
        admin1 = msg.sender;
        admin2 = msg.sender;
        token = _token;
        proxy = _proxy;
    }

    /**
     * @notice Set token contract attached to interactor.
     *
     * @param _newTokenContract Token contract address.
     */
    function setToken(address _newTokenContract) public onlyOwner {
        token = _newTokenContract;
    }

    /**
     * @notice Claim token contract ownership after ownership is transferred to
     * this interactor contract.
     */
    function claimTokenOwnership() public onlyOwner {
        Claimable(token).claimOwnership();
    }

    /**
     * @notice Set proxy contract attached to interactor.
     *
     * @param _newProxyContract Proxy contract address.
     */
    function setProxy(address _newProxyContract) public onlyOwner {
        proxy = _newProxyContract;
    }

    /**
     * @notice Claim proxy contract ownership after ownership is transferred to
     * this interactor contract.
     */
    function claimProxyOwnership() public onlyOwner {
        Claimable(proxy).claimOwnership();
    }

    /**
     * @notice Setup address to be Admin 1.
     *
     * @param _newAdminAddress Admin address.
     */
    function setFirstAdmin(address _newAdminAddress) public onlyOwner {
        require(_newAdminAddress != address(0), "Admin cannot be 0x0 address");
        admin1 = _newAdminAddress;
    }

    /**
     * @notice Setup address to be Admin 2.
     *
     * @param _newAdminAddress Admin address.
     */
    function setSecondAdmin(address _newAdminAddress) public onlyOwner {
        require(_newAdminAddress != address(0), "Admin cannot be 0x0 address");
        admin2 = _newAdminAddress;
    }

    /**
     * @notice Setup token contract address on attached proxy contract.
     *
     * @dev Only allowed if token contract is already owned by this interactor.
     *
     * @param _token Ownable token address.
     */
    function setTokenOnProxy(Ownable _token) public onlyOwner {
        require(Ownable(_token).owner() == address(this), "Interactor not owner of token");
        ProxyInterface(proxy).setToken(_token);
    }

    /**
     * @notice Setup proxy contract address on attached token contract.
     *
     * @dev Only allowed if proxy contract is already owned by this interactor.
     *
     * @param _proxy Ownable proxy address.
     */
    function setProxyOnToken(Ownable _proxy) public onlyOwner {
        require(Ownable(_proxy).owner() == address(this), "Interactor not owner of proxy");
        ProxySupportedERC20Interface(token).setProxy(_proxy);
    }

    /**
     * @notice Allows owner of interactor to transfer contracts owned by the
     * interactor. For example, the token and proxy contracts.
     *
     * @dev Useful in the situation where a new updated interactor is required.
     *
     * @param _ownedContract Current contract address owned by interactor.
     * @param _newOwner Address to transfer ownership to.
     */
    function transferOwnedContract(
        Ownable _ownedContract,
        address _newOwner
    )
        public
        onlyOwner
    {
        _ownedContract.transferOwnership(_newOwner);
    }

    /**
     * @notice Allows owner of interactor to claim contracts owned by the
     * token contract that the interactor owns.
     *
     * @dev This way the ownership of these contracts can then be transfered. 
     * Useful for eg. token modules.
     *
     * @param _contractAddress Contract address that is owned by attached token.
     */
    function claimContractFromToken(Claimable _contractAddress) public onlyOwner {
        TokenInterface(token).transferContractOwnership(_contractAddress);
        Claimable(_contractAddress).claimOwnership();
    }

    /**
     * @notice Set balance module of attached token.
     *
     * @param _moduleAddress Address of balance module.
     */
    function setBalanceModule(address _moduleAddress) public onlyOwner returns (bool) {
        return TokenInterface(token).setBalanceModule(_moduleAddress);
    }

    /**
     * @notice Set allowance module of attached token.
     *
     * @param _moduleAddress Address of allowance module.
     */
    function setAllowanceModule(address _moduleAddress) public onlyOwner returns (bool) {
        return TokenInterface(token).setAllowanceModule(_moduleAddress);
    }

    /**
     * @notice Set registry module of attached token.
     *
     * @param _moduleAddress Address of registry module.
     */
    function setRegistryModule(address _moduleAddress) public onlyOwner returns (bool) {
        return TokenInterface(token).setRegistryModule(_moduleAddress);
    }
}

