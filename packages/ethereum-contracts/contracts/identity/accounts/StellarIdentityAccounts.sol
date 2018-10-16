pragma solidity 0.4.24;

import "./IdentityAccounts.sol";
import "../../lib/Arrays.sol";
import "../../lib/ownership/Ownable.sol";


/**
 * @title StellarIdentityAccounts
 * @author Wu Di
 * @notice Implementation of the IdentityAccounts interface
 */
contract StellarIdentityAccounts is Ownable, IdentityAccounts {

    using Arrays for Arrays.bytes32NoDup;

    address public registry;

    // 2-way mapping for easy lookup
    // identity address => array of stellar address in bytes32
    mapping (address => Arrays.bytes32NoDup) internal accounts;
    // stellar address in bytes32 => identity address
    mapping (bytes32 => address) internal identities;
    mapping (bytes32 => address) internal pending;

    constructor(address _registry) public {
        registry = _registry;
    }

    /**
     * @dev Modifier that only allows the identity owner itself.
     */
    modifier onlyIdentity(address identity) {
        require(
            msg.sender == identity,
            "Operation can only be called by identity owner"
        );
        _;
    }

    /**
     * @dev Modifier that only allows the contract owner or the identity owner.
     */
    modifier onlyOwnerOrIdentity(address identity) {
        require(
            msg.sender == owner || msg.sender == identity,
            "Operation can only be called by identity owner or contract owner"
        );
        _;
    }

    /**
     * @dev Modifier that only allows account that is linked to identity.
     */
    modifier onlyLinkedAccount(address identity, bytes32 account) {
        require(
            identities[account] == identity,
            "Account is not linked to identity"
        );
        _;
    }

    /**
     * @dev Modifier that only allows account that is not linked to identity.
     */
    modifier onlyUnlinkedAccount(bytes32 account) {
        require(
            identities[account] == address(0),
            "Account is linked to an identity"
        );
        _;
    }

    /**
     * @dev Find the identity address, if account is tied to an identity
     * @param account Ethereum address in bytes32 form
     * @return address(0) if account is not tied to an identity, else the
     *  identity contract address
     */
    function getIdentity(bytes32 account)
        public
        view
        returns (address)
    {
        return identities[account];
    }

    /**
     * @dev Find the identity's accounts
     * @param identity The identity contract address
     * @return List of accounts owned by the identity
     */
    function getAccounts(address identity)
        public
        view
        returns (bytes32[])
    {
        return accounts[identity].values;
    }

    /**
     * @dev Adds an account to an identity contract.
     * @param identity The identity contract address to add the account to
     * @param account The account to be added
     * @return `true` if the addition request is successful, `false` otherwise
     */
    function addAccount(address identity, bytes32 account)
        public
        onlyOwner
        onlyUnlinkedAccount(account)
        returns (bool)
    {
        require(identity != address(0), "Invalid identity address");

        pending[account] = identity;

        emit AccountRequested(identity, account);

        return true;
    }

    /**
     * @dev Approves the addition of an ethereum account to an identity contract.
     *  Only the identity contract owner can approve the addition of an account
     *  to itself.
     * @param identity The identity contract address to add the account to
     * @param account The account to be added
     * @return `true` if the approval is successful, `false` otherwise
     */
    function approve(address identity, bytes32 account)
        public
        onlyIdentity(identity)
        onlyUnlinkedAccount(account)
        returns (bool)
    {
        require(
            pending[account] == identity,
            "Account is not pending addition to identity"
        );
        delete pending[account];
        accounts[identity].add(account);
        identities[account] = identity;

        emit AccountAdded(identity, account);

        return true;
    }

    /**
     * @dev Removes an ethereum account from an identity contract.
     *  Only this contract's owner or the identity contract owner can approve
     *  the removal of an account.
     * @param identity The identity contract address to remove the account from
     * @param account The account to be removed
     * @return `true` if the account removal is successful, `false` otherwise
     */
    function removeAccount(address identity, bytes32 account)
        public
        onlyOwnerOrIdentity(identity)
        onlyLinkedAccount(identity, account)
        returns (bool)
    {
        accounts[identity].remove(account);
        delete identities[account];

        emit AccountRemoved(identity, account);

        return true;
    }
}
