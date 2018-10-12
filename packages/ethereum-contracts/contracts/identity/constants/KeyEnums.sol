pragma solidity 0.4.24;


/**
 * @title KeyEnums
 * @author Wu Di
 * @notice Constants for ERC725 keys
 */
contract KeyEnums {
    uint256 public constant MANAGEMENT_KEY = 1;
    uint256 public constant ACTION_KEY = 2;
    uint256 public constant CLAIM_SIGNER_KEY = 3;
    uint256 public constant ENCRYPTION_KEY = 4;

    uint256 public constant ECDSA_TYPE = 1;
    uint256 public constant RSA_TYPE = 2;
}
