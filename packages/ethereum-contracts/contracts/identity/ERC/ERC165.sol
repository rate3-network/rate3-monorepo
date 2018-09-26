pragma solidity 0.4.24;


/**
 * @title ERC165
 * @author Wu Di
 * @notice Abstract contract for ERC165
 * @dev Based on https://github.com/ethereum/EIPs/pull/881
 */
contract ERC165 {
    /**
     * @dev You must not set element 0xffffffff to true
     */
    mapping(bytes4 => bool) internal supportedInterfaces;

    /**
     * bytes4(keccak256('supportsInterface(bytes4)'))
     */
    bytes4 public constant ERC165ID = 0x01ffc9a7;

    /**
     * @dev Constructor that adds ERC165 as a supported interface
     */
    constructor() internal {
        supportedInterfaces[ERC165ID] = true;
    }

    /**
     * @notice Query if a contract implements an interface
     * @param interfaceID The interface identifier, as specified in ERC-165
     * @dev Interface identification is specified in ERC-165. This function
     *  uses less than 30,000 gas.
     * @return `true` if the contract implements `interfaceID` and
     *  `interfaceID` is not 0xffffffff, `false` otherwise
     */
    function supportsInterface(bytes4 interfaceID) external view returns (bool) {
        return supportedInterfaces[interfaceID];
    }
}
