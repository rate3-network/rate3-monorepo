pragma solidity ^0.4.24;

import "./ModularToken.sol";

contract CompliantToken is ModularToken {

    string public constant WHITELISTED_FOR_MINT = "WHITELISTED_FOR_MINT";
    string public constant WHITELISTED_FOR_BURN = "WHITELISTED_FOR_BURN";
    string public constant WHITELISTED_FOR_TRANSFER = "WHITELISTED_FOR_TRANSFER";
    string public constant BLACKLISTED = "BLACKLISTED";

    modifier whitelistedForMint(address _mintDestinationAddress) {
        require(isWhitelistedForMint(_mintDestinationAddress), "Not whitelisted for mint");
        _;
    }

    modifier whitelistedForBurn(address _burnOriginAddress) {
        require(isWhitelistedForBurn(_burnOriginAddress), "Not whitelisted for burn");
        _;
    }

    // modifier whitelistedForTransfer(address _transferOriginAddress, address _transferDestinationAddress) {
    //     require(registryModule.getKey(_transferOriginAddress, WHITELISTED_FOR_TRANSFER), "Origin not whitelisted for transfer");
    //     require(registryModule.getKey(_transferDestinationAddress, WHITELISTED_FOR_TRANSFER), "Destination not whitelisted for transfer");
    //     _;
    // }

    modifier notBlacklisted(address _address) {
        require(!isBlacklisted(_address), "Address is blacklisted");
        _;
    }

    function burn(
        address _from,
        uint256 _value
    )
        public
        onlyOwner
        whitelistedForBurn(_from)
        notBlacklisted(_from)
        returns (bool)
    {
        super.burn(_from, _value);
    }

    function mint(
        address _to,
        uint256 _value
    ) 
        public
        onlyOwner
        whitelistedForMint(_to)
        notBlacklisted(_to)
        returns (bool)
    {
        super.mint(_to, _value);
    }

    // function transfer(
    //     address _to,
    //     uint256 _value
    // )
    //     public
    //     whitelistedForTransfer(msg.sender, _to)
    //     notBlacklisted(msg.sender)
    //     notBlacklisted(_to)
    //     returns (bool)
    // {
    //     super.transfer(_to, _value);
    // }

    // function transferFrom(
    //     address _from,
    //     address _to,
    //     uint256 _value
    // )
    //     public
    //     whitelistedForTransfer(_from, _to)
    //     notBlacklisted(_from)
    //     notBlacklisted(_to)
    //     returns (bool)
    // {
    //     super.transferFrom(_from, _to, _value);
    // }

    function isWhitelistedForMint(address _address) public view returns (bool) {
        uint256 integerValue;
        string memory stringValue;
        address addressValue;
        bool booleanValue;
        address managerAddress;
        uint256 recordTimestamp;
        (integerValue, stringValue, addressValue, booleanValue, managerAddress, recordTimestamp)
            = registryModule.getDataRecord(_address, WHITELISTED_FOR_MINT);
        return booleanValue;
    }

    function isWhitelistedForBurn(address _address) public view returns (bool) {
        uint256 integerValue;
        string memory stringValue;
        address addressValue;
        bool booleanValue;
        address managerAddress;
        uint256 recordTimestamp;
        (integerValue, stringValue, addressValue, booleanValue, managerAddress, recordTimestamp)
            = registryModule.getDataRecord(_address, WHITELISTED_FOR_BURN);
        return booleanValue;
    }

    function isBlacklisted(address _address) public view returns (bool) {
        uint256 integerValue;
        string memory stringValue;
        address addressValue;
        bool booleanValue;
        address managerAddress;
        uint256 recordTimestamp;
        (integerValue, stringValue, addressValue, booleanValue, managerAddress, recordTimestamp)
            = registryModule.getDataRecord(_address, BLACKLISTED);
        return booleanValue;
    }
}