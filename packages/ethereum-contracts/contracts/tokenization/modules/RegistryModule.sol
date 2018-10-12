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
    
    /**
     * @notice Set key data record in registry module for a particular address.
     *
     * @param _forAddress The address to be associated with the data record.
     * @param _key The string value for key.
     * @param _integerValue The integer value, 0 default.
     * @param _stringValue The string value, '' default.
     * @param _addressValue The address value, address(0) default.
     * @param _booleanValue The boolean value, false default.
     * @param _managerAddress Manager address that added this data record.
     */
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

    /**
     * @notice Get key data record in registry module for a particular address.
     *
     * @param _forAddress The address associated with the data record.
     * @param _key The string value for key.
     */
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

    /**
     * @notice Check if key exist.
     *
     * @param _forAddress The address associated with the data record.
     * @param _key The string value for key.
     * 
     * @return Key exist with a data record.
     */
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