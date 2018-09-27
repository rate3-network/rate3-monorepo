pragma solidity ^0.4.24;

import "../shared/ERC20.sol";
import "../shared/ProxySupportedERC20Interface.sol";
import "./ModularToken.sol";

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
        require(_value <= balanceModule.balanceOf(_sender), "Insufficient balance");
        require(_to != address(0), "Transfer to 0x0 address is not allowed");

        balanceModule.subBalance(_sender, _value);
        balanceModule.addBalance(_to, _value);

        emit Transfer(_sender, _to, _value);
        return true;
    }

    function approveWithSender(address _sender, address _spender, uint256 _value) public onlyProxy whenNotPaused returns (bool) {
        require(_spender != address(0), "Spender cannot be 0x0 address");
        
        allowanceModule.setAllowance(_sender, _spender, _value);

        emit Approval(_sender, _spender, _value);
        return true;
    }

    function transferFromWithSender(address _sender, address _from, address _to, uint256 _value) public onlyProxy whenNotPaused returns (bool) {
        require(_value <= balanceModule.balanceOf(_from), "Insufficient balance");
        require(_to != address(0), "Transfer to 0x0 address is not allowed");
        require(_value <= allowanceModule.allowanceOf(_from, _sender), "Insufficient allowance");

        allowanceModule.subAllowance(_from, _sender, _value);
        balanceModule.subBalance(_from, _value);
        balanceModule.addBalance(_to, _value);

        emit Transfer(_from, _to, _value);
    }

    function increaseApprovalWithSender(address _sender, address _spender, uint256 _addedValue) public onlyProxy whenNotPaused returns (bool) {
        require(_spender != address(0), "Spender cannot be 0x0 address");

        allowanceModule.addAllowance(_sender, _spender, _addedValue);

        emit Approval(_sender, _spender, allowanceModule.allowanceOf(_sender, _spender));
        return true;
    }

    function decreaseApprovalWithSender(address _sender, address _spender, uint256 _subtractedValue) public onlyProxy whenNotPaused returns (bool) {
        require(_spender != address(0), "Spender cannot be 0x0 address");

        uint256 oldValue = allowanceModule.allowanceOf(_sender, _spender);
        if (_subtractedValue >= oldValue) {
            allowanceModule.setAllowance(_sender, _spender, 0);
        } else {
            allowanceModule.subAllowance(_sender, _spender, _subtractedValue);
        }

        emit Approval(_sender, _spender, allowanceModule.allowanceOf(_sender, _spender));
        return true;
    }
}