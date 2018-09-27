pragma solidity ^0.4.24;

import "../../lib/math/SafeMath.sol";
import "../../lib/ownership/Claimable.sol";
import "../../lib/lifecycle/Pausable.sol";
import "../shared/ERC20.sol";
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

    uint256 totalSupply_;

    event BalanceModuleSet(address indexed moduleAddress);
    event AllowanceModuleSet(address indexed moduleAddress);
    event RegistryModuleSet(address indexed moduleAddress);
    event Burn(address indexed from, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Sweep(address indexed authorizer, address indexed from, address indexed to, uint256 value);


    /**
     * @dev Set the BalanceModule.
     * @param _moduleAddress The address of the BalanceModule.
     */
    function setBalanceModule(address _moduleAddress) public onlyOwner returns (bool) {
        balanceModule = BalanceModule(_moduleAddress);
        balanceModule.claimOwnership();
        emit BalanceModuleSet(_moduleAddress);
        return true;
    }

    /**
     * @dev Set the AllowanceModule.
     * @param _moduleAddress The address of the AllowanceModule.
     */
    function setAllowanceModule(address _moduleAddress) public onlyOwner returns (bool) {
        allowanceModule = AllowanceModule(_moduleAddress);
        allowanceModule.claimOwnership();
        emit AllowanceModuleSet(_moduleAddress);
        return true;
    }

    /**
     * @dev Set the RegistryModule.
     * @param _moduleAddress The address of the RegistryModule.
     */
    function setRegistryModule(address _moduleAddress) public onlyOwner returns (bool) {
        registryModule = RegistryModule(_moduleAddress);
        registryModule.claimOwnership();
        emit RegistryModuleSet(_moduleAddress);
        return true;
    }

    function transferContractOwnership(address _contractAddress) public onlyOwner {
        Claimable(_contractAddress).transferOwnership(msg.sender);
    }

    /**
     * @dev ERC20 functionality - Gets the total number of tokens in existence.
     */
    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    /**
     * @dev ERC20 functionality - Gets the balance of the specified address.
     * @param _owner The address to query the the balance of.
     * @return A uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balanceModule.balanceOf(_owner);
    }

    /**
     * @dev ERC20 functionality - Check the amount of tokens that an owner approved for a spender.
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowanceModule.allowanceOf(_owner, _spender);
    }

    /**
     * @dev ERC20 functionality - Transfer tokens for a specified address.
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     */
    function transfer(address _to, uint256 _value) public whenNotPaused returns (bool) {
        require(_value <= balanceModule.balanceOf(msg.sender), "Insufficient balance");
        require(_to != address(0), "Transfer to 0x0 address is not allowed");

        balanceModule.subBalance(msg.sender, _value);
        balanceModule.addBalance(_to, _value);

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @dev ERC20 functionality - Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     *
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * @param _spender The address which will spend the funds.
     * @param _value The amount of tokens to be spent.
     */
    function approve(address _spender, uint256 _value) public whenNotPaused returns (bool) {
        require(_spender != address(0), "Spender cannot be 0x0 address");

        allowanceModule.setAllowance(msg.sender, _spender, _value);

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev ERC20 functionality - Transfer tokens from one address to another.
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to.
     * @param _value uint256 the amount of tokens to be transferred.
     */
    function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused returns (bool) {
        require(_value <= balanceModule.balanceOf(_from), "Insufficient balance");
        require(_to != address(0), "Transfer to 0x0 address is not allowed");
        require(_value <= allowanceModule.allowanceOf(_from, msg.sender), "Insufficient allowance");

        allowanceModule.subAllowance(_from, msg.sender, _value);
        balanceModule.subBalance(_from, _value);
        balanceModule.addBalance(_to, _value);

        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     */
    function increaseApproval(address _spender, uint256 _addedValue) public whenNotPaused returns (bool) {
        require(_spender != address(0), "Spender cannot be 0x0 address");

        allowanceModule.addAllowance(msg.sender, _spender, _addedValue);

        emit Approval(msg.sender, _spender, allowanceModule.allowanceOf(msg.sender, _spender));
        return true;
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseApproval(address _spender, uint256 _subtractedValue) public whenNotPaused returns (bool) {
        require(_spender != address(0), "Spender cannot be 0x0 address");

        uint256 oldValue = allowanceModule.allowanceOf(msg.sender, _spender);

        if (_subtractedValue >= oldValue) {
            allowanceModule.setAllowance(msg.sender, _spender, 0);
        } else {
            allowanceModule.subAllowance(msg.sender, _spender, _subtractedValue);
        }

        emit Approval(msg.sender, _spender, allowanceModule.allowanceOf(msg.sender, _spender));
        return true;
    }

    /**
     * @dev Burns a specific amount of tokens.
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
     * @dev Function to mint tokens.
     * @param _to The address that will receive the minted tokens.
     * @param _value The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address _to, uint256 _value) public onlyOwner returns (bool) {
        totalSupply_ = totalSupply_.add(_value);
        balanceModule.addBalance(_to, _value);

        emit Mint(_to, _value);
        emit Transfer(address(0), _to, _value);
        return true;
    }

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
