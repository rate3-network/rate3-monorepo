pragma solidity ^0.4.24;

interface TokenInterface {
    function burn(address _from, uint256 _value) external returns (bool);
    function mint(address _to, uint256 _value) external returns (bool);
    function setKeyDataRecord(
        address _forAddress,
        string _key,
        uint256 _integerValue,
        string _stringValue,
        address _addressValue,
        bool _booleanValue,
        address _managerAddress
    )
        external;
}