pragma solidity ^0.4.24;

import "../../lib/math/SafeMath.sol";
import "../../lib/ownership/Claimable.sol";
import "../../lib/lifecycle/Pausable.sol";
import "../interfaces/ERC20.sol";
import "../modules/AllowanceModule.sol";
import "../modules/BalanceModule.sol";
import "../modules/RegistryModule.sol";

/**
 * @title Modular token that allows for interchangable modules for data storage.
 *
 * @notice ERC20-compatible and Pausable (public functions can be freezed).
 *
 * @dev Owner of modules should be set to this token contract. In addition,
 * this token contract should be owned by an interactor contract, once setup
 * is complete.
 * Allows for sweeping of tokens from any account, accessible only by the Owner.
 */
contract ModularToken is ERC20, Claimable, Pausable {
    using SafeMath for uint256;

    BalanceModule public balanceModule;
    AllowanceModule public allowanceModule;
    RegistryModule public registryModule;

    string public name_;
    string public symbol_;
    uint8 public decimals_;
    uint256 public totalSupply_;

    event BalanceModuleSet(address indexed moduleAddress);
    event AllowanceModuleSet(address indexed moduleAddress);
    event RegistryModuleSet(address indexed moduleAddress);
    event Burn(address indexed from, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Sweep(address indexed authorizer, address indexed from, address indexed to, uint256 value);

    constructor(string _name, string _symbol, uint8 _decimals) public {
        name_ = _name;
        symbol_ = _symbol;
        decimals_ = _decimals;
    }

    /**
     * @notice Returns the name of the token.
     *
     * @return Name of the token.
     */
    function name() public view returns (string) {
        return name_;
    }

    /**
     * @notice Returns the symbol of the token.
     *
     * @return Symbol of the token.
     */
    function symbol() public view returns (string) {
        return symbol_;
    }

    /**
     * @notice Returns the number of decimals the token uses.
     *
     * @return Number of decimals.
     */
    function decimals() public view returns (uint8) {
        return decimals_;
    }

    /**
     * @notice Set the BalanceModule.
     *
     * @param _moduleAddress The address of the BalanceModule.
     */
    function setBalanceModule(address _moduleAddress) public onlyOwner returns (bool) {
        balanceModule = BalanceModule(_moduleAddress);
        balanceModule.claimOwnership();
        emit BalanceModuleSet(_moduleAddress);
        return true;
    }

    /**
     * @notice Set the AllowanceModule.
     *
     * @param _moduleAddress The address of the AllowanceModule.
     */
    function setAllowanceModule(address _moduleAddress) public onlyOwner returns (bool) {
        allowanceModule = AllowanceModule(_moduleAddress);
        allowanceModule.claimOwnership();
        emit AllowanceModuleSet(_moduleAddress);
        return true;
    }

    /**
     * @notice Set the RegistryModule.
     *
     * @param _moduleAddress The address of the RegistryModule.
     */
    function setRegistryModule(address _moduleAddress) public onlyOwner returns (bool) {
        registryModule = RegistryModule(_moduleAddress);
        registryModule.claimOwnership();
        emit RegistryModuleSet(_moduleAddress);
        return true;
    }

    /**
     * @notice Transfers _contractAddress contract owned by this contract to
     * msg.sender (which is limited to only the owner of this contract).
     *
     * @param _contractAddress The contract to transfer ownership.
     */
    function transferContractOwnership(address _contractAddress) public onlyOwner {
        Claimable(_contractAddress).transferOwnership(msg.sender);
    }

    /**
     * @notice ERC20 functionality - Gets the total number of tokens in existence.
     */
    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    /**
     * @notice ERC20 functionality - Gets the balance of the specified address.
     *
     * @param _owner The address to query the the balance of.
     *
     * @return A uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balanceModule.balanceOf(_owner);
    }

    /**
     * @notice ERC20 functionality - Check the amount of tokens that an owner approved for a spender.
     *
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     *
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowanceModule.allowanceOf(_owner, _spender);
    }

    /**
     * @notice ERC20 functionality - Transfer tokens for a specified address.
     *
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     */
    function transfer(address _to, uint256 _value) public whenNotPaused returns (bool) {
        return _transfer(msg.sender, _to, _value);
    }

    /**
     * @notice Internal function to include the _from address.
     *
     * @param _from The address to transfer from.
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     */
    function _transfer(address _from, address _to, uint256 _value) internal returns (bool) {
        require(_value <= balanceModule.balanceOf(_from), "Insufficient balance");
        require(_to != address(0), "Transfer to 0x0 address is not allowed");

        balanceModule.subBalance(_from, _value);
        balanceModule.addBalance(_to, _value);

        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @notice ERC20 functionality - Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     *
     * @dev Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * @param _spender The address which will spend the funds.
     * @param _value The amount of tokens to be spent.
     */
    function approve(address _spender, uint256 _value) public whenNotPaused returns (bool) {
        return _approve(msg.sender, _spender, _value);
    }

    /**
     * @notice Internal function to include the _from address.
     *
     * @param _from The address which is the source of funds.
     * @param _spender The address which will spend the funds.
     * @param _value The amount of tokens to be spent.
     */
    function _approve(address _from, address _spender, uint256 _value) internal returns (bool) {
        require(_spender != address(0), "Spender cannot be 0x0 address");

        allowanceModule.setAllowance(_from, _spender, _value);

        emit Approval(_from, _spender, _value);
        return true;
    }

    /**
     * @notice ERC20 functionality - Transfer tokens from one address to another.
     *
     * @param _from The address which you want to send tokens from.
     * @param _to The address which you want to transfer to.
     * @param _value The amount of tokens to be transferred.
     */
    function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused returns (bool) {
        return _transferFrom(msg.sender, _from, _to, _value);
    }

    /**
     * @notice Internal function to include spender.
     *
     * @param _spender The address which is spending this transaction.
     * @param _from The address which you want to send tokens from.
     * @param _to The address which you want to transfer to.
     * @param _value The amount of tokens to be transferred.
     */
    function _transferFrom(address _spender, address _from, address _to, uint256 _value) internal returns (bool) {
        require(_value <= balanceModule.balanceOf(_from), "Insufficient balance");
        require(_to != address(0), "Transfer to 0x0 address is not allowed");
        require(_value <= allowanceModule.allowanceOf(_from, _spender), "Insufficient allowance");

        allowanceModule.subAllowance(_from, _spender, _value);
        balanceModule.subBalance(_from, _value);
        balanceModule.addBalance(_to, _value);

        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @notice Increase the amount of tokens that an owner allowed to a spender.
     *
     * @dev approve should be called when allowed[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     *
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     */
    function increaseApproval(address _spender, uint256 _addedValue) public whenNotPaused returns (bool) {
        return _increaseApproval(msg.sender, _spender, _addedValue);
    }

    /**
     * @notice Internal function to include _from address.
     *
     * @param _from The address which is the source of funds.
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     */
    function _increaseApproval(address _from, address _spender, uint256 _addedValue) internal returns (bool) {
        require(_spender != address(0), "Spender cannot be 0x0 address");

        allowanceModule.addAllowance(_from, _spender, _addedValue);

        emit Approval(_from, _spender, allowanceModule.allowanceOf(_from, _spender));
        return true;
    }

    /**
     * @notice Decrease the amount of tokens that an owner allowed to a spender.
     *
     * @dev approve should be called when allowed[_spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     *
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseApproval(address _spender, uint256 _subtractedValue) public whenNotPaused returns (bool) {
        return _decreaseApproval(msg.sender, _spender, _subtractedValue);
    }

    /**
     * @notice Internal function to include _from address.
     *
     * @param _from The address which is the source of funds.
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     */
    function _decreaseApproval(address _from, address _spender, uint256 _subtractedValue) internal returns (bool) {
        require(_spender != address(0), "Spender cannot be 0x0 address");

        uint256 oldValue = allowanceModule.allowanceOf(_from, _spender);

        if (_subtractedValue >= oldValue) {
            allowanceModule.setAllowance(_from, _spender, 0);
        } else {
            allowanceModule.subAllowance(_from, _spender, _subtractedValue);
        }

        emit Approval(_from, _spender, allowanceModule.allowanceOf(_from, _spender));
        return true;
    }

    /**
     * @notice Burns a specific amount of tokens.
     *
     * @param _from The address that tokens will be burned from.
     * @param _value The amount of token to be burned.
     * @return A boolean that indicates if the operation was successful.
     */
    function burn(address _from, uint256 _value) public onlyOwner returns (bool) {
        require(_value <= balanceModule.balanceOf(_from), "Insufficient balance");

        balanceModule.subBalance(_from, _value);
        totalSupply_ = totalSupply_.sub(_value);

        emit Burn(_from, _value);
        emit Transfer(_from, address(0), _value);
        return true;
    }

    /**
     * @notice Function to mint tokens.
     *
     * @param _to The address that will receive the minted tokens.
     * @param _value The amount of tokens to mint.
     *
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address _to, uint256 _value) public onlyOwner returns (bool) {
        totalSupply_ = totalSupply_.add(_value);
        balanceModule.addBalance(_to, _value);

        emit Mint(_to, _value);
        emit Transfer(address(0), _to, _value);
        return true;
    }

    /**
     * @notice Set key data record in registry module for a particular address.
     *
     * @param _forAddress The address to be associated with the data record.
     * @param _key The string value for key.
     * @param _integerValue The integer value, 0 default.
     * @param _stringValue The string value, '' default.
     * @param _addressValue The address value, address(0) default.
     * @param _booleanValue The boolean value, false default.
     * @param _managerAddress Manager address that added this data record.
     */
    function setKeyDataRecord(
        address _forAddress,
        string _key,
        uint256 _integerValue,
        string _stringValue,
        address _addressValue,
        bool _booleanValue,
        address _managerAddress
    )
        public
        onlyOwner
    {
        registryModule.setKeyDataRecord(
            _forAddress,
            _key,
            _integerValue,
            _stringValue,
            _addressValue,
            _booleanValue,
            _managerAddress
        );
    }

    /**
     * @notice Get key data record in registry module for a particular address.
     *
     * @param _forAddress The address associated with the data record.
     * @param _key The string value for key.
     */
    function getDataRecord(
        address _forAddress,
        string _key
    )
        public
        view
        returns 
    (
        uint256,
        string,
        address,
        bool,
        address,
        uint256
    ) {
        return registryModule.getDataRecord(_forAddress, _key);
    }

    /**
     * @notice Check if key exist.
     *
     * @param _forAddress The address associated with the data record.
     * @param _key The string value for key.
     * 
     * @return Key exist with a data record.
     */
    function getKey(
        address _forAddress,
        string _key
    )
        public
        view
        returns (bool)
    {
        return registryModule.getKey(_forAddress, _key);
    }

    /**
     * @notice Sweeps tokens from any address and transfers the tokens to
     * another address.
     *
     * @dev WARNING: Should only be used when neccessary.
     * Restricted to owner of contract.
     *
     * @param _authorizer Address that sanctioned sweep.
     * @param _from Target address to sweep tokens from.
     * @param _to Address to store sweeped tokens.
     * @param _value Amount of tokens to sweep.
     */
    function sweep(address _authorizer, address _from, address _to, uint256 _value) external onlyOwner {
        uint256 balance = balanceModule.balanceOf(_from);
        require(_value <= balance, "Insufficient balance");
        require(_to != address(0), "Transfer to 0x0 address is not allowed");    

        balanceModule.subBalance(_from, _value);
        balanceModule.addBalance(_to, _value);

        emit Sweep(_authorizer, _from, _to, _value);
    }
}
