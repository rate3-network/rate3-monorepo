pragma solidity ^0.4.24;

import "../../lib/ownership/Claimable.sol";

/**
 * @title A key-value store where the value is a generic DataRecord.
 *
 * @notice A single DataRecord can store uint256, string, boolean and address values.
 *
 * @dev Since block.timestamp is recorded for each DataRecord, to identify whether
 * a DataRecord exist for a key-DataRecord pair is to check whether
 * dataRecordedTimestamp > 0
 */
contract RegistryModule is Claimable {
    mapping (address => mapping(string => DataRecord)) private registry;

    struct DataRecord {
        uint256 integerValue;
        string stringValue;
        address addressValue;
        bool booleanValue;
        address managerAddress;
        uint256 dataRecordedTimestamp;
    }

    event DataRecordSet(
        address indexed forAddress,
        string key,
        uint256 integerValue,
        string stringValue,
        address indexed addressValue,
        bool booleanValue,
        address indexed managerAddress,
        uint256 dataRecordedTimestamp
    );
    
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
        registry[_forAddress][_key] = DataRecord(
            _integerValue,
            _stringValue,
            _addressValue,
            _booleanValue,
            _managerAddress,
            block.timestamp
        );

        emit DataRecordSet(
            _forAddress,
            _key,
            _integerValue,
            _stringValue,
            _addressValue,
            _booleanValue,
            _managerAddress,
            block.timestamp
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
        DataRecord memory record = registry[_forAddress][_key];
        return (
            record.integerValue,
            record.stringValue,
            record.addressValue,
            record.booleanValue,
            record.managerAddress,
            record.dataRecordedTimestamp
        );
    }


    function getKey(
        address _forAddress,
        string _key
    )
        public
        view
        returns (bool)
    {
        return (registry[_forAddress][_key].dataRecordedTimestamp > 0);
    }
}