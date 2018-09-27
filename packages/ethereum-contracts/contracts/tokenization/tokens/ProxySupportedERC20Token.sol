pragma solidity ^0.4.24;

import "../shared/ERC20.sol";
import "../shared/ProxySupportedERC20Interface.sol";
import "./ModularToken.sol";

/**
 * @title Proxy supported ERC20 token
 *
 * @notice Proxy forwarded calls to the token contains an additional sender
 * parameter - msg.sender in this case is the proxy contract which is not
 * the information that we need.
 *
 * @dev It is important that ONLY the proxy contract can call the '-withSender'
 * functions. Only forwarded calls from the proxy set are accepted.
 */
contract ProxySupportedERC20Token is ModularToken, ProxySupportedERC20Interface {

    ERC20 proxy;

    modifier onlyProxy() {
        require(msg.sender == address(proxy), "Only proxy is allowed.");
        _;
    }

    function setProxy(address _proxy) public onlyOwner {
        proxy = ERC20(_proxy);
    }

    function transferWithSender(address _sender, address _to, uint256 _value) public onlyProxy whenNotPaused returns (bool) {
        return _transfer(_sender, _to, _value);
    }

    function approveWithSender(address _sender, address _spender, uint256 _value) public onlyProxy whenNotPaused returns (bool) {
        return _approve(_sender, _spender, _value);
    }

    function transferFromWithSender(address _sender, address _from, address _to, uint256 _value) public onlyProxy whenNotPaused returns (bool) {
        return _transferFrom(_sender, _from, _to, _value);
    }

    function increaseApprovalWithSender(address _sender, address _spender, uint256 _addedValue) public onlyProxy whenNotPaused returns (bool) {
        return _increaseApproval(_sender, _spender, _addedValue);
    }

    function decreaseApprovalWithSender(address _sender, address _spender, uint256 _subtractedValue) public onlyProxy whenNotPaused returns (bool) {
        return _decreaseApproval(_sender, _spender, _subtractedValue);
    }
}