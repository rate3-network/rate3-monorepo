pragma solidity 0.4.24;

/**
 * @title Interface for ProxySupportedERC20Token
 */
interface ProxySupportedERC20Interface {
    function transferWithSender(address _sender, address _to, uint256 _value) external returns (bool);
    function approveWithSender(address _sender, address _spender, uint256 _value) external returns (bool);
    function transferFromWithSender(address _sender, address _from, address _to, uint256 _value) external returns (bool);
    function increaseApprovalWithSender(address _sender, address _spender, uint _addedValue) external returns (bool);
    function decreaseApprovalWithSender(address _sender, address _spender, uint _subtractedValue) external returns (bool);
    function setProxy(address _proxy) external;
}