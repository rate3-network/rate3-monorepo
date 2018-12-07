pragma solidity 0.4.24;

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

    /**
     * @notice PendingRegistry keeps track of a registry modification that needs confirmation.
     */
    struct PendingRegistry {
        AdminStates requestState;
        bool status;
        uint256 requestTimestamp;
    }

    enum AdminStates {
        INVALID,
        ADMIN1,
        ADMIN2
    }

    mapping (address => PendingRegistry) public pendingWhitelistForMint;
    mapping (address => PendingRegistry) public pendingWhitelistForBurn;
    mapping (address => PendingRegistry) public pendingBlacklist;

    event PendingWhitelistForMint(address indexed whitelistAddress, bool status, address indexed whitelistedBy, uint256 whitelistTimestamp);
    event PendingWhitelistForBurn(address indexed whitelistAddress, bool status, address indexed whitelistedBy, uint256 whitelistTimestamp);
    event PendingBlacklist(address indexed blacklistAddress, bool status, address indexed blacklistedBy, uint256 blacklistTimestamp);

    event WhitelistedForMint(address indexed whitelistedAddress, bool status, address indexed whitelistedBy, uint256 whitelistTimestamp);
    event WhitelistedForBurn(address indexed whitelistedAddress, bool status, address indexed whitelistedBy, uint256 whitelistTimestamp);
    event Blacklisted(address indexed blacklistedAddress, bool status, address indexed blacklistedBy, uint256 blacklistTimestamp);

    event RevokedWhitelistForMint(address indexed whitelistAddress, bool status, address indexed revokedBy, uint256 revokeTimestamp);
    event RevokedWhitelistForBurn(address indexed whitelistAddress, bool status, address indexed revokedBy, uint256 revokeTimestamp);
    event RevokedBlacklist(address indexed blacklistAddress, bool status, address indexed revokedBy, uint256 revokeTimestamp);

    /**
     * @notice Set up a PendingRegistry to update the minting whitelist status for address provided.
     *
     * @dev Only admin can whitelist/blacklist.
     *
     * @param _address Address to be added or removed from whitelist.
     * @param _bool True if address whitelisted.
     */
    function whitelistForMint(address _address, bool _bool) public onlyAdmin {
        PendingRegistry storage pendingRegistry = pendingWhitelistForMint[_address];
        require(pendingRegistry.requestState == AdminStates.INVALID, "Pending registry already exist.");
        AdminStates adminState;
        if (msg.sender == admin1) {
            adminState = AdminStates.ADMIN1;
        } else if (msg.sender == admin2) {
            adminState = AdminStates.ADMIN2;
        }
        pendingWhitelistForMint[_address] = PendingRegistry(
            adminState,
            _bool,
            block.timestamp
        );
        emit PendingWhitelistForMint(
            _address,
            _bool,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Finalize the minting whitelist status for address provided.
     *
     * @dev Only admin can whitelist/blacklist. Only applicable if there is already a Pending Registry requested.
     *
     * @param _address Address to be added or removed from whitelist.
     * @param _bool True if address whitelisted.
     */
    function finalizeWhitelistForMint(address _address, bool _bool) public onlyAdmin {
        PendingRegistry memory pendingRegistry = pendingWhitelistForMint[_address];
        // If requested by admin1, needs admin2 approval, and vice versa.
        require((pendingRegistry.requestState == AdminStates.ADMIN1 && msg.sender == admin2) || (pendingRegistry.requestState == AdminStates.ADMIN2 && msg.sender == admin1), "Need seperate admin.");
        // Require matching boolean value.
        require(pendingRegistry.status == _bool, "Non-matching status value.");

        // Clear struct.
        delete pendingWhitelistForMint[_address];

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
     * @notice Reject the minting whitelist status for address provided.
     *
     * @dev Only admin can whitelist/blacklist. Only applicable if there is already a Pending Registry requested.
     *
     * @param _address Address to be added or removed from whitelist.
     */
    function revokeWhitelistForMint(address _address) public onlyAdmin {
        PendingRegistry memory pendingRegistry = pendingWhitelistForMint[_address];
        emit RevokedWhitelistForMint(
            _address,
            pendingRegistry.status,
            msg.sender,
            block.timestamp
        );
        delete pendingWhitelistForMint[_address];
    }

    /**
     * @notice Set up a PendingRegistry to update the burning whitelist status for address provided.
     *
     * @dev Only admin can whitelist/blacklist.
     *
     * @param _address Address to be added or removed from whitelist.
     * @param _bool True if address whitelisted.
     */
    function whitelistForBurn(address _address, bool _bool) public onlyAdmin {
        PendingRegistry storage pendingRegistry = pendingWhitelistForBurn[_address];
        require(pendingRegistry.requestState == AdminStates.INVALID, "Pending registry already exist.");
        AdminStates adminState;
        if (msg.sender == admin1) {
            adminState = AdminStates.ADMIN1;
        } else if (msg.sender == admin2) {
            adminState = AdminStates.ADMIN2;
        }
        pendingWhitelistForBurn[_address] = PendingRegistry(
            adminState,
            _bool,
            block.timestamp
        );
        emit PendingWhitelistForBurn(
            _address,
            _bool,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Finalize the burning whitelist status for address provided.
     *
     * @dev Only admin can whitelist/blacklist. Only applicable if there is already a Pending Registry requested.
     *
     * @param _address Address to be added or removed from whitelist.
     * @param _bool True if address whitelisted.
     */
    function finalizeWhitelistForBurn(address _address, bool _bool) public onlyAdmin {
        PendingRegistry memory pendingRegistry = pendingWhitelistForBurn[_address];
        // If requested by admin1, needs admin2 approval, and vice versa.
        require((pendingRegistry.requestState == AdminStates.ADMIN1 && msg.sender == admin2) || (pendingRegistry.requestState == AdminStates.ADMIN2 && msg.sender == admin1), "Need seperate admin.");
        // Require matching boolean value.
        require(pendingRegistry.status == _bool, "Non-matching status value.");

        // Clear struct.
        delete pendingWhitelistForBurn[_address];

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
     * @notice Reject the burning whitelist status for address provided.
     *
     * @dev Only admin can whitelist/blacklist. Only applicable if there is already a Pending Registry requested.
     *
     * @param _address Address to be added or removed from whitelist.
     */
    function revokeWhitelistForBurn(address _address) public onlyAdmin {
        PendingRegistry memory pendingRegistry = pendingWhitelistForBurn[_address];
        emit RevokedWhitelistForBurn(
            _address,
            pendingRegistry.status,
            msg.sender,
            block.timestamp
        );
        delete pendingWhitelistForBurn[_address];
    }

    /**
     * @notice Set up a PendingRegistry to update the blacklist status for address provided.
     *
     * @dev Only admin can whitelist/blacklist.
     *
     * @param _address Address to be added or removed from blacklist.
     * @param _bool True if address blacklisted.
     */
    function blacklist(address _address, bool _bool) public onlyAdmin {
        PendingRegistry storage pendingRegistry = pendingBlacklist[_address];
        require(pendingRegistry.requestState == AdminStates.INVALID, "Pending registry already exist.");
        AdminStates adminState;
        if (msg.sender == admin1) {
            adminState = AdminStates.ADMIN1;
        } else if (msg.sender == admin2) {
            adminState = AdminStates.ADMIN2;
        }
        pendingBlacklist[_address] = PendingRegistry(
            adminState,
            _bool,
            block.timestamp
        );
        emit PendingBlacklist(
            _address,
            _bool,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Finalize the blacklist status for address provided.
     *
     * @dev Only admin can whitelist/blacklist. Only applicable if there is already a Pending Registry requested.
     *
     * @param _address Address to be added or removed from blacklist.
     * @param _bool True if address blacklisted.
     */
    function finalizeBlacklist(address _address, bool _bool) public onlyAdmin {
        PendingRegistry memory pendingRegistry = pendingBlacklist[_address];
        // If requested by admin1, needs admin2 approval, and vice versa.
        require((pendingRegistry.requestState == AdminStates.ADMIN1 && msg.sender == admin2) || (pendingRegistry.requestState == AdminStates.ADMIN2 && msg.sender == admin1), "Need seperate admin.");
        // Require matching boolean value.
        require(pendingRegistry.status == _bool, "Non-matching status value.");

        // Clear struct.
        delete pendingBlacklist[_address];

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

    /**
     * @notice Reject the blacklist status for address provided.
     *
     * @dev Only admin can whitelist/blacklist. Only applicable if there is already a Pending Registry requested.
     *
     * @param _address Address to be added or removed from blacklist.
     */
    function revokeBlacklist(address _address) public onlyAdmin {
        PendingRegistry memory pendingRegistry = pendingBlacklist[_address];
        emit RevokedBlacklist(
            _address,
            pendingRegistry.status,
            msg.sender,
            block.timestamp
        );
        delete pendingBlacklist[_address];
    }
}