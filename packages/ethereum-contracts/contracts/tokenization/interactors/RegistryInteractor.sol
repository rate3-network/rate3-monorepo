pragma solidity ^0.4.24;

import "../interfaces/TokenInterface.sol";
import "./AdminInteractor.sol";

/**
 * @title For registry operations to set key data records on registry module on token.
 *
 * @dev String constants should be consistent with what is expected on the token side.
 */
contract RegistryInteractor is AdminInteractor {
    /// @notice String constants for compliance
    string public constant WHITELISTED_FOR_MINT = "WHITELISTED_FOR_MINT";
    string public constant WHITELISTED_FOR_BURN = "WHITELISTED_FOR_BURN";
    string public constant BLACKLISTED = "BLACKLISTED";

    event WhitelistedForMint(address indexed whitelistedAddress, bool status, address indexed whitelistedBy, uint256 whitelistTimestamp);
    event WhitelistedForBurn(address indexed whitelistedAddress, bool status, address indexed whitelistedBy, uint256 whitelistTimestamp);
    event Blacklisted(address indexed blacklistedAddress, bool status, address indexed blacklistedBy, uint256 blacklistTimestamp);

    /**
     * @notice Set the minting whitelist status for address provided.
     *
     * @dev Only admin can whitelist/blacklist.
     *
     * @param _address Address to be added or removed from whitelist.
     * @param _bool True if address whitelisted.
     */
    function whitelistForMint(address _address, bool _bool) public onlyAdmin {
        TokenInterface(token).setKeyDataRecord(
            _address,
            WHITELISTED_FOR_MINT,
            0,
            "",
            address(0),
            _bool,
            msg.sender
        );
        emit WhitelistedForMint(
            _address,
            _bool,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Set the burning whitelist status for address provided.
     *
     * @dev Only admin can whitelist/blacklist.
     *
     * @param _address Address to be added or removed from whitelist.
     * @param _bool True if address whitelisted.
     */
    function whitelistForBurn(address _address, bool _bool) public onlyAdmin {
        TokenInterface(token).setKeyDataRecord(
            _address,
            WHITELISTED_FOR_BURN,
            0,
            "",
            address(0),
            _bool,
            msg.sender
        );
        emit WhitelistedForBurn(
            _address,
            _bool,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Set the blacklist status for address provided.
     *
     * @dev Only admin can whitelist/blacklist.
     *
     * @param _address Address to be added or removed from blacklist.
     * @param _bool True if address blacklisted.
     */
    function blacklist(address _address, bool _bool) public onlyAdmin {
        TokenInterface(token).setKeyDataRecord(
            _address,
            BLACKLISTED,
            0,
            "",
            address(0),
            _bool,
            msg.sender
        );
        emit Blacklisted(
            _address,
            _bool,
            msg.sender,
            block.timestamp
        );
    }
}