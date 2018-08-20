pragma solidity ^0.4.24;

import "../../lib/math/SafeMath.sol";
import "../../lib/ownership/Claimable.sol";
import "../modules/ModularToken.sol";

contract OperationsInteractor is Claimable {
    using SafeMath for uint256;

    struct MintRequestOperation {
        address by;
        address to;
        uint256 value;
        uint256 requestTimestamp;
        address approvedBy;
        bool approved;
        uint256 approvalTimestamp;
        uint256 finalizeTimestamp;
    }

    struct BurnRequestOperation {
        address by;
        address from;
        uint256 value;
        uint256 requestTimestamp;
        address approvedBy;
        bool approved;
        uint256 approvalTimestamp;
        uint256 finalizeTimestamp;
    }

    address public admin;
    ModularToken public token;
    uint256 public operationDelay;

    mapping (address => MintRequestOperation[]) public mintRequestOperations;
    mapping (address => BurnRequestOperation[]) public BurnRequestOperations;

    modifier onlyAdminOrOwner() {
        require(msg.sender == admin || msg.sender == owner, "Only allowed for Admin or Owner");
        _;
    }

    event MintOperationRequested(address indexed by, address indexed to, uint256 value, uint256 requestTimestamp, uint256 index);
    event BurnOperationRequested(address indexed by, address indexed from, uint256 value, uint256 requestTimestamp, uint256 index);

    event MintOperationApproved();
    event BurnOperationApproved();

    event MintOperationFinalized();
    event BurnOperationFinalized();

    event MintOperationRevoked();
    event BurnOperationRevoked();

    constructor() public {
        admin = msg.sender;
        operationDelay = 6 hours;
    }

    function requestMint(address _to, uint256 _value) public {
        uint256 requestTimestamp = block.timestamp;
        MintRequestOperation memory mintRequestOperation = MintRequestOperation(msg.sender, _to, _value, requestTimestamp);

        emit MintOperationRequested(msg.sender, _to, _value, requestTimestamp, mintRequestOperations[msg.sender].length);
        mintRequestOperations[msg.sender].push(mintRequestOperation);
    }

    function approveMint(address _requestor, uint256 _index) public onlyAdminOrOwner {
        MintRequestOperation storage mintRequestOperation = mintRequestOperations[_requestor][_index];

        require(!mintRequestOperation.approved, "MintRequestOperation is already approved");

        uint256 finalizeTimestamp = block.timestamp;
        if (msg.sender != owner) {
            finalizeTimestamp = finalizeTimestamp.add(operationDelay);
        }

        mintRequestOperation.approvedBy = msg.sender;
        mintRequestOperation.approved = true;
        mintRequestOperation.approvalTimestamp = block.timestamp;
        mintRequestOperation.finalizeTimestamp = finalizeTimestamp;
    }

    function finalizeMint(address _requestor, uint256 _index) public onlyAdminOrOwner {
        MintRequestOperation memory mintRequestOperation = mintRequestOperations[_requestor][_index];
        require(mintRequestOperation.finalizeTimestamp <= block.timestamp, "Action is still timelocked");
        address mintAddress = mintRequestOperation.to;
        uint256 value = mintRequestOperation.value;
        delete mintRequestOperations[_requestor][_index];
        token.mint(mintAddress, value);
    }

    function revokeMint(address _requestor, uint256 _index) public onlyAdminOrOwner {
        delete mintRequestOperations[_requestor][_index];
    }

}