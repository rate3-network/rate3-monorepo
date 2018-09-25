pragma solidity 0.4.24;

import "../lib/ownership/Ownable.sol";
import "./Identity.sol";
import "./constants/KeyEnums.sol";
import "./accounts/IdentityAccounts.sol";
import "./accounts/EthereumIdentityAccounts.sol";


/**
 * @title IdentityRegistry
 * @author Wu Di
 * @notice Implement registry of Identity
 */
contract IdentityRegistry is Ownable {

    uint256 public constant ETH_NETWORK = 1;

    event NewIdentity(address sender, address identity);

    KeyEnums private keyEnums;
    EthereumIdentityAccounts private ethIdentityAccounts;

    constructor(KeyEnums _keyEnums) public {
        keyEnums = _keyEnums;
    }

    // Mapping from ethereum wallet to ERC725 + ERC735 identity
    mapping (address => address) public identities;

    // Mapping of networks to identity accounts, i.e. Ethereum = 1, Stellar = 2
    mapping (uint256 => IdentityAccounts) public networkAccounts;

    /**
     * @dev Creates a new identity and adds it to the registry
     */
    function createIdentity()
        external
        returns (address)
    {
        require(
            ethIdentityAccounts != address(0),
            "Ethereum identity accounts is not set"
        );
        require(identities[msg.sender] == address(0), "Identity exists");
        Identity newIdentity = new Identity(msg.sender, keyEnums);
        identities[msg.sender] = newIdentity;

        ethIdentityAccounts.newIdentity(newIdentity, msg.sender);

        emit NewIdentity(msg.sender, newIdentity);

        return newIdentity;
    }

    /**
     * @dev Checks whether an identity exists in the registry
     * @param addr The identity contract address to check for
     */
    function hasIdentity(address addr)
        public
        view
        returns (bool)
    {
        return identities[addr] != address(0);
    }

    function setEthereumIdentityAccounts(EthereumIdentityAccounts acc)
        public
        onlyOwner
    {
        require(acc.registry() == address(this), "Registry mismatch");
        ethIdentityAccounts = acc;
        networkAccounts[ETH_NETWORK] = acc;
    }

    /**
     * @dev Sets the network identity accounts contract
     * @param network The network to set
     * @param acc The identity accounts contract
     */
    function setIdentityAccounts(uint256 network, IdentityAccounts acc)
        public
        onlyOwner
    {
        require(network != ETH_NETWORK, "Cannot change ethereum identity accounts");
        networkAccounts[network] = acc;
    }

    /**
     * @dev Removes the network identity accounts contract
     * @param network The network to remove
     */
    function removeIdentityAccounts(uint256 network)
        public
        onlyOwner
    {
        require(network != ETH_NETWORK, "Cannot remove ethereum identity accounts");
        delete networkAccounts[network];
    }
}
