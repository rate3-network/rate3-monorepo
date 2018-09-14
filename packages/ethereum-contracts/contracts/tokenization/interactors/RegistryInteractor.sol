pragma solidity ^0.4.24;

import "../../lib/math/SafeMath.sol";
import "./BaseAdminInteractor.sol";

contract RegistryInteractor is BaseAdminInteractor {
    using SafeMath for uint256;

    string public constant WHITELISTED_FOR_MINT = "WHITELISTED_FOR_MINT";
    string public constant WHITELISTED_FOR_BURN = "WHITELISTED_FOR_BURN";
    string public constant WHITELISTED_FOR_TRANSFER = "WHITELISTED_FOR_TRANSFER";
    string public constant BLACKLISTED = "BLACKLISTED";

    constructor(
        TokenizeTemplateToken _token
    ) 
        public
        BaseAdminInteractor(_token)
    {
    }

    function whitelistForMint(address _address) public onlyAdmin {
        token.setKeyDataRecord(
            _address,
            WHITELISTED_FOR_MINT,
            0,
            "",
            address(0),
            true,
            msg.sender
        );
    }

    function whitelistForBurn(address _address) public onlyAdmin {
        token.setKeyDataRecord(
            _address,
            WHITELISTED_FOR_BURN,
            0,
            "",
            address(0),
            true,
            msg.sender
        );
    }

    function whitelistFoTransfer(address _address) public onlyAdmin {
        token.setKeyDataRecord(
            _address,
            WHITELISTED_FOR_TRANSFER,
            0,
            "",
            address(0),
            true,
            msg.sender
        );
    }

    function blacklist(address _address) public onlyAdmin {
        token.setKeyDataRecord(
            _address,
            BLACKLISTED,
            0,
            "",
            address(0),
            true,
            msg.sender
        );
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
        onlyAdmin
    {
        token.setKeyDataRecord(
            _forAddress,
            _key,
            _integerValue,
            _stringValue,
            _addressValue,
            _booleanValue,
            _managerAddress  
        );
    }

}