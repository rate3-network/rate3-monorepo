pragma solidity ^0.4.24;

import "../../lib/math/SafeMath.sol";
import "./BaseAdminInteractor.sol";

contract RegistryInteractor is BaseAdminInteractor {
    using SafeMath for uint256;

    string public constant WHITELISTED_FOR_MINT = "WHITELISTED_FOR_MINT";
    string public constant WHITELISTED_FOR_BURN = "WHITELISTED_FOR_BURN";
    string public constant WHITELISTED_FOR_TRANSFER = "WHITELISTED_FOR_TRANSFER";
    string public constant BLACKLISTED = "BLACKLISTED";

    function whitelistForMint(address _address, bool _bool) public onlyAdmin {
        token.setKeyDataRecord(
            _address,
            WHITELISTED_FOR_MINT,
            0,
            "",
            address(0),
            _bool,
            msg.sender
        );
    }

    function whitelistForBurn(address _address, bool _bool) public onlyAdmin {
        token.setKeyDataRecord(
            _address,
            WHITELISTED_FOR_BURN,
            0,
            "",
            address(0),
            _bool,
            msg.sender
        );
    }

    function whitelistForTransfer(address _address, bool _bool) public onlyAdmin {
        token.setKeyDataRecord(
            _address,
            WHITELISTED_FOR_TRANSFER,
            0,
            "",
            address(0),
            _bool,
            msg.sender
        );
    }

    function blacklist(address _address, bool _bool) public onlyAdmin {
        token.setKeyDataRecord(
            _address,
            BLACKLISTED,
            0,
            "",
            address(0),
            _bool,
            msg.sender
        );
    }

}