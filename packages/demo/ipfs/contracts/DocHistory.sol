pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "openzeppelin-solidity/contracts/ownership/Whitelist.sol";

contract DocHistory is Whitelist, Destructible {
  event DocAdded(
    bytes docHash,
    uint indexed docTypeId,
    address indexed owner,
    address indexed recipient
  );

  string[] public docTypes;
  mapping(bytes32 => uint) public docTypeToId;

  function addDocType(string docType) external onlyOwner {
    require(bytes(docType).length > 0);
    bytes32 key = keccak256(abi.encodePacked(docType));
    require(docTypes.length == 0 || docTypeToId[key] == 0);

    uint docTypeId = docTypes.push(docType) - 1;

    docTypeToId[key] = docTypeId;
  }

  function docTypesLength() external view returns (uint) {
    return docTypes.length;
  }

  function addDocument(bytes docHash, uint docTypeId, address owner, address recipient) external onlyWhitelisted {
    require(docTypeId < docTypes.length);

    emit DocAdded(docHash, docTypeId, owner, recipient);
  }
}
