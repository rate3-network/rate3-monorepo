pragma solidity ^0.4.24;

import "./ModularToken.sol";

/**
 * @title Adds compliance checks to various token actions.
 *
 * @dev String constants used as key across contracts should be consistent.
 */
contract CompliantToken is ModularToken {

    string public constant WHITELISTED_FOR_MINT = "WHITELISTED_FOR_MINT";
    string public constant WHITELISTED_FOR_BURN = "WHITELISTED_FOR_BURN";
    string public constant BLACKLISTED = "BLACKLISTED";

    modifier whitelistedForMint(address _mintDestinationAddress) {
        require(isWhitelistedForMint(_mintDestinationAddress), "Not whitelisted for mint");
        _;
    }

    modifier whitelistedForBurn(address _burnOriginAddress) {
        require(isWhitelistedForBurn(_burnOriginAddress), "Not whitelisted for burn");
        _;
    }

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
        return super.burn(_from, _value);
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
        return super.mint(_to, _value);
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _value
    )
        internal
        notBlacklisted(_from)
        notBlacklisted(_to)
        returns (bool)
    {
        return super._transfer(_from, _to, _value);
    }

    function _transferFrom(
        address _spender,
        address _from,
        address _to,
        uint256 _value
    )
        internal
        notBlacklisted(_spender)
        notBlacklisted(_from)
        notBlacklisted(_to)
        returns (bool)
    {
        return super._transferFrom(_spender, _from, _to, _value);
    }

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