pragma solidity ^0.4.24;

import "../modules/ModularToken.sol";

contract DelegateLayer is ModularToken {
    DelegateLayer public delegate;
    
    function setDelegate(DelegateLayer _delegateAddress) public onlyOwner {
        delegate = _delegateAddress;
    }

     /**
     * @dev ERC20 functionality - Gets the total number of tokens in existence.
     */
    function totalSupply() public view returns (uint256) {
        if (delegate == address(0)) {
            return super.totalSupply();
        } else {
            return delegate.totalSupply();
        }
    }

    /**
     * @dev ERC20 functionality - Gets the balance of the specified address.
     * @param _owner The address to query the the balance of.
     * @return A uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address _owner) public view returns (uint256 balance) {
        if (delegate == address(0)) {
            return super.balanceOf(_owner);
        } else {
            return delegate.balanceOf(_owner);
        }
    }

    /**
     * @dev ERC20 functionality - Check the amount of tokens that an owner approved for a spender.
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(address _owner, address _spender) public view returns (uint256) {
        if (delegate == address(0)) {
            return super.allowance(_owner, _spender);
        } else {
            return delegate.allowance(_owner, _spender);
        }
    }

    /**
     * @dev ERC20 functionality - Transfer tokens for a specified address.
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     */
    function transfer(address _to, uint256 _value) public whenNotPaused returns (bool) {
        if (delegate == address(0)) {
            return super.transfer(_to, _value);
        } else {
            return delegate.transfer(_to, _value);
        }
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
        if (delegate == address(0)) {
            return super.approve(_spender, _value);
        } else {
            return delegate.approve(_spender, _value);
        }
    }

    /**
     * @dev ERC20 functionality - Transfer tokens from one address to another.
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to.
     * @param _value uint256 the amount of tokens to be transferred.
     */
    function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused returns (bool) {
        if (delegate == address(0)) {
            return super.transferFrom(_from, _to, _value);
        } else {
            return delegate.transferFrom(_from, _to, _value);
        }
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
    function increaseApproval(address _spender, uint _addedValue) public whenNotPaused returns (bool) {
        if (delegate == address(0)) {
            return super.increaseApproval(_spender, _addedValue);
        } else {
            return delegate.increaseApproval(_spender, _addedValue);
        }
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
    function decreaseApproval(address _spender, uint _subtractedValue) public whenNotPaused returns (bool) {
        if (delegate == address(0)) {
            return super.decreaseApproval(_spender, _subtractedValue);
        } else {
            return delegate.decreaseApproval(_spender, _subtractedValue);
        }
    }

}