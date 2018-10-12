pragma solidity ^0.4.24;

import "../interfaces/ERC20.sol";
import "../interfaces/ProxySupportedERC20Interface.sol";
import "./AdminProxy.sol";

/**
 * @title ERC20 Proxy contract that forwards ERC20 functionality to an actual
 * token contract implementation.
 */
contract ERC20Proxy is ERC20, AdminProxy {

    /// @notice  Returns the name of the token.
    string public name;

    /// @notice  Returns the symbol of the token.
    string public symbol;

    /// @notice  Returns the number of decimals the token uses.
    uint8 public decimals;

    constructor(
        string _name,
        string _symbol,
        uint8 _decimals
    )
        public
    {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

     /**
      * @notice Gets the total amount of tokens in existence.
      *
      * @return Total amount of tokens in existence.
      */
    function totalSupply() public view returns (uint256) {
        return ERC20(token).totalSupply();
    }

     /**
      * @notice Gets the balance of the specified address.
      *
      * @param _owner The address to query the the balance of.
      *
      * @return The amount owned by the passed address.
      */
    function balanceOf(address _owner) public view returns (uint256) {
        return ERC20(token).balanceOf(_owner);
    }

    /**
     * @notice Check the amount of tokens that an owner approved for a spender.
     *
     * @param _owner The address which owns the funds.
     * @param _spender The address which will spend the funds.
     *
     * @return The amount of tokens still available for the spender.
     */
    function allowance(address _owner, address _spender) public view returns (uint256) {
        return ERC20(token).allowance(_owner, _spender);
    }

    /**
     * @notice Transfer tokens to a specified address.
     *
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     *
     * @return Transfer completion success.
     */
    function transfer(address _to, uint256 _value) public returns (bool) {
        return ProxySupportedERC20Interface(token).transferWithSender(msg.sender, _to, _value);
    }

    /**
     * @notice Transfer tokens from one address to another.
     *
     * @param _from The address which you want to send tokens from.
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     *
     * @return Transfer completion success.
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        return ProxySupportedERC20Interface(token).transferFromWithSender(msg.sender, _from, _to, _value);
    }

    /**
     * @notice Approve the passed address to spend the specified amount of 
     * tokens on behalf of msg.sender.
     *
     * @dev Beware that changing an allowance with this method brings the risk 
     * that someone may use both the old and the new allowance by unfortunate 
     * transaction ordering. One possible solution to mitigate this race 
     * condition is to first reduce the spender's allowance to 0 and set the 
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * @param _spender The address which will spend the funds.
     * @param _value The amount of tokens to be spent.
     *
     * @return Approve completion success.
     */
    function approve(address _spender, uint256 _value) public returns (bool) {
        return ProxySupportedERC20Interface(token).approveWithSender(msg.sender, _spender, _value);
    }

    /**
     * @notice Increase the amount of tokens that an owner allowed to a spender.
     *
     * @dev approve should be called when allowed[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait 
     * until the first transaction is mined)
     * From MonolithDAO Token.sol
     *
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     *
     * @return Approval completion success.
     */
    function increaseApproval(address _spender, uint256 _addedValue) public returns (bool) {
        return ProxySupportedERC20Interface(token).increaseApprovalWithSender(msg.sender, _spender, _addedValue);
    }

    /**
     * @notice Decrease the amount of tokens that an owner allowed to a spender.
     *
     * @dev approve should be called when allowed[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait 
     * until the first transaction is mined)
     * From MonolithDAO Token.sol
     *
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     *
     * @return Approval completion success.
     */
    function decreaseApproval(address _spender, uint256 _subtractedValue) public returns (bool) {
        return ProxySupportedERC20Interface(token).decreaseApprovalWithSender(msg.sender, _spender, _subtractedValue);
    }
}