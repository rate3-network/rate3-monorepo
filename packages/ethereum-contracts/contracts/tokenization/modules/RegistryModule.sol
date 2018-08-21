pragma solidity ^0.4.24;

import "../../lib/ownership/Claimable.sol";

contract RegistryModule is Claimable {
    struct DataRecord {
        uint256 integerValue;
        string stringValue;
        address addressValue;
        bool booleanValue;
        address managerAddress;
        uint256 dataRecordedTimestamp;
    }

    constructor() public {

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

    }

    function getKey(address _forAddress, string _key) public view returns (bool) {

    }

    // Returns the exact value of the attribute, as well as its metadata
    function getDataRecord(
        address _forAddress,
        string _key
    )
        public
        view
        returns (uint256, string, address, bool, address, uint256)
    {

    }
}