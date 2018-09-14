pragma solidity ^0.4.24;

import "../../lib/math/SafeMath.sol";
import "./BaseAdminInteractor.sol";

contract RegistryInteractor is BaseAdminInteractor {
    using SafeMath for uint256;

    constructor(
        TokenizeTemplateToken _token
    ) 
        public
        BaseAdminInteractor(_token)
    {
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