pragma solidity 0.4.24;


/**
 * @title IdentityAccounts
 * @author Wu Di
 * @notice Interface for identity accounts contracts
 */
interface IdentityAccounts {
    event AccountRequested(address identity, bytes32 account);
    event AccountAdded(address identity, bytes32 account);
    event AccountRemoved(address identity, bytes32 account);

    function addAccount(address identity, bytes32 account) external returns (bool);
    function removeAccount(address identity, bytes32 account) external returns (bool);
    function approve(address identity, bytes32 account) external returns (bool);
    function getIdentity(bytes32 account) external view returns (address);
    function getAccounts(address identity) external view returns (bytes32[]);
}
