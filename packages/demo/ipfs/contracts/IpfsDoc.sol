pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "./DocHistory.sol";

contract IpfsDoc is Destructible {
  DocHistory private docHistory;

  constructor(address _docHistory) public {
    docHistory = DocHistory(_docHistory);
  }

  function isValidIPFSMultihash(bytes _hash) internal pure returns (bool) {
    require(_hash.length > 2);

    uint8 _length;

    assembly {
      _length := byte(0, mload(add(_hash, 33)))
    }

    return (_hash.length == _length + 2);
  }

  function Submit(bytes hash, uint docTypeId, address recipient) external {
    require(isValidIPFSMultihash(hash));
    docHistory.addDocument(hash, docTypeId, msg.sender, recipient);
  }
}
