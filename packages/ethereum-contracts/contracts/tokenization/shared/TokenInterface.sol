pragma solidity ^0.4.24;

/**
 * @title Interface for BaseToken
 */
interface TokenInterface {
    function setBalanceModule(address _moduleAddress) external returns (bool);
    function setAllowanceModule(address _moduleAddress) external returns (bool);
    function setRegistryModule(address _moduleAddress) external returns (bool);
    function transferContractOwnership(address _contractAddress) external;

    function burn(address _from, uint256 _value) external returns (bool);
    function mint(address _to, uint256 _value) external returns (bool);
    function isWhitelistedForMint(address _address) external view returns (bool);
    function isWhitelistedForBurn(address _address) external view returns (bool);
    function isBlacklisted(address _address) external view returns (bool);

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
    function getDataRecord(
        address _forAddress,
        string _key
    )
        external
        view
        returns 
    (
        uint256,
        string,
        address,
        bool,
        address,
        uint256
    );
    function getKey(
        address _forAddress,
        string _key
    )
        external
        view
        returns (bool);

    function sweep(address _authorizer, address _from, address _to, uint256 _value) external;
    function pause() external;
    function unpause() external;
}