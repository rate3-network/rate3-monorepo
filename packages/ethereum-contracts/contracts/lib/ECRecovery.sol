pragma solidity 0.4.24;


/**
 * @title Elliptic curve signature operations
 * @dev Library taken from
 * https://github.com/OpenZeppelin/openzeppelin-solidity/blob/v1.12.0/contracts/ECRecovery.sol
 */
library ECRecovery {
    /**
     * @dev Recover signer address from a message by using their signature
     * @param _hash bytes32 message, the hash is the signed message. What is recovered is the signer address.
     * @param _sig bytes signature, the signature is generated using web3.eth.sign()
     */
    function recover(bytes32 _hash, bytes _sig)
        internal
        pure
        returns (address)
    {
        bytes32 r;
        bytes32 s;
        uint8 v;

        // Check the signature length
        if (_sig.length != 65) {
            return (address(0));
        }

        // Divide the signature in r, s and v variables
        // ecrecover takes the signature parameters, and the only way to get them
        // currently is to use assembly.
        // solhint-disable-next-line no-inline-assembly
        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }

        // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
        if (v < 27) {
            v += 27;
        }

        // If the version is correct return the signer address
        if (v != 27 && v != 28) {
            return (address(0));
        } else {
          // solium-disable-next-line arg-overflow
            return ecrecover(_hash, v, r, s);
        }
    }

    /**
     * toEthSignedMessageHash
     * @dev prefix a bytes32 value with "\x19Ethereum Signed Message:"
     * and hash the result
     */
    function toEthSignedMessageHash(bytes32 _hash)
        internal
        pure
        returns (bytes32)
    {
      // 32 is the length in bytes of hash,
      // enforced by the type signature above
        return keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)
        );
    }
}