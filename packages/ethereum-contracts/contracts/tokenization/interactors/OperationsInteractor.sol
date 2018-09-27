pragma solidity ^0.4.24;

import "../../lib/math/SafeMath.sol";
import "../shared/TokenInterface.sol";
import "./AdminInteractor.sol";

/**
 * @title For tokenization operations such as minting and burning of tokens.
 *
 * @notice Operations flow: Request -> Approval by first admin -> Finalize by second admin
 */
contract OperationsInteractor is AdminInteractor {
    using SafeMath for uint256;

    struct MintRequestOperation {
        address by;
        uint256 value;
        uint256 requestTimestamp;
        address approvedBy;
        bool approved;
        uint256 approvalTimestamp;
    }

    struct BurnRequestOperation {
        address by;
        uint256 value;
        uint256 requestTimestamp;
        address approvedBy;
        bool approved;
        uint256 approvalTimestamp;
    }

    mapping (address => MintRequestOperation[]) public mintRequestOperations;
    mapping (address => BurnRequestOperation[]) public burnRequestOperations;

    bool operationsPaused;

    modifier operationsNotPaused() {
        require(!operationsPaused, "Operations are paused");
        _;
    }

    modifier whitelistedForMint(address _mintDestinationAddress) {
        require(TokenInterface(token).isWhitelistedForMint(_mintDestinationAddress), "Not whitelisted for mint");
        _;
    }

    modifier whitelistedForBurn(address _burnOriginAddress) {
        require(TokenInterface(token).isWhitelistedForBurn(_burnOriginAddress), "Not whitelisted for burn");
        _;
    }
    
    event MintOperationRequested(address indexed by, uint256 value, uint256 requestTimestamp, uint256 index);
    event BurnOperationRequested(address indexed by, uint256 value, uint256 requestTimestamp, uint256 index);

    event MintOperationApproved(address indexed by, address indexed approvedBy, uint256 approvalTimestamp, uint256 index);
    event BurnOperationApproved(address indexed by, address indexed approvedBy, uint256 approvalTimestamp, uint256 index);

    event MintOperationFinalized(address indexed by, address indexed finalizedBy, uint256 finalizedTimestamp, uint256 index);
    event BurnOperationFinalized(address indexed by, address indexed finalizedBy, uint256 finalizedTimestamp, uint256 index);

    event MintOperationRevoked(address indexed by, address indexed revokedBy, uint256 revokedTimestamp, uint256 index);
    event BurnOperationRevoked(address indexed by, address indexed revokedBy, uint256 revokedTimestamp, uint256 index);

    function requestMint(uint256 _value) public operationsNotPaused whitelistedForMint(msg.sender) {
        require(_value > 0, "Mint value should be more than 0");

        uint256 requestTimestamp = block.timestamp;
        MintRequestOperation memory mintRequestOperation = MintRequestOperation(msg.sender, _value, requestTimestamp, address(0), false, 0);

        emit MintOperationRequested(msg.sender, _value, requestTimestamp, mintRequestOperations[msg.sender].length);
        mintRequestOperations[msg.sender].push(mintRequestOperation);
    }

    function approveMint(address _requestor, uint256 _index) public onlyAdmin1 operationsNotPaused whitelistedForMint(_requestor) {
        MintRequestOperation storage mintRequestOperation = mintRequestOperations[_requestor][_index];

        require(!mintRequestOperation.approved, "MintRequestOperation is already approved");
        require(mintRequestOperation.value > 0, "MintRequestOperation does not exist");

        mintRequestOperation.approvedBy = msg.sender;
        mintRequestOperation.approved = true;
        mintRequestOperation.approvalTimestamp = block.timestamp;

        emit MintOperationApproved(_requestor, msg.sender, block.timestamp, _index);
    }

    function finalizeMint(address _requestor, uint256 _index) public onlyAdmin2 operationsNotPaused whitelistedForMint(_requestor) {
        MintRequestOperation memory mintRequestOperation = mintRequestOperations[_requestor][_index];

        require(mintRequestOperation.approved, "Mint Operation is not approved");
        require(mintRequestOperation.value > 0, "MintRequestOperation does not exist");

        address mintAddress = mintRequestOperation.by;
        uint256 value = mintRequestOperation.value;
        delete mintRequestOperations[_requestor][_index];
        TokenInterface(token).mint(mintAddress, value);

        emit MintOperationFinalized(_requestor, msg.sender, block.timestamp, _index);
    }

    function revokeMint(address _requestor, uint256 _index) public onlyAdmin {
        delete mintRequestOperations[_requestor][_index];
        emit MintOperationRevoked(_requestor, msg.sender, block.timestamp, _index);
    }

    function requestBurn(uint256 _value) public operationsNotPaused whitelistedForBurn(msg.sender) {
        require(_value > 0, "Burn value should be more than 0");

        uint256 requestTimestamp = block.timestamp;
        BurnRequestOperation memory burnRequestOperation = BurnRequestOperation(msg.sender, _value, requestTimestamp, address(0), false, 0);

        emit BurnOperationRequested(msg.sender, _value, requestTimestamp, burnRequestOperations[msg.sender].length);
        burnRequestOperations[msg.sender].push(burnRequestOperation);
    }

    function approveBurn(address _requestor, uint256 _index) public onlyAdmin1 operationsNotPaused whitelistedForBurn(_requestor) {
        BurnRequestOperation storage burnRequestOperation = burnRequestOperations[_requestor][_index];

        require(!burnRequestOperation.approved, "BurnRequestOperation is already approved");
        require(burnRequestOperation.value > 0, "BurnRequestOperation does not exist");

        burnRequestOperation.approvedBy = msg.sender;
        burnRequestOperation.approved = true;
        burnRequestOperation.approvalTimestamp = block.timestamp;

        emit BurnOperationApproved(_requestor, msg.sender, block.timestamp, _index);
    }

    function finalizeBurn(address _requestor, uint256 _index) public onlyAdmin2 operationsNotPaused whitelistedForBurn(_requestor) {
        BurnRequestOperation memory burnRequestOperation = burnRequestOperations[_requestor][_index];

        require(burnRequestOperation.approved, "Burn Operation is not approved");
        require(burnRequestOperation.value > 0, "BurnRequestOperation does not exist");

        address burnAddress = burnRequestOperation.by;
        uint256 value = burnRequestOperation.value;
        delete burnRequestOperations[_requestor][_index];
        TokenInterface(token).burn(burnAddress, value);

        emit BurnOperationFinalized(_requestor, msg.sender, block.timestamp, _index);
    }

    function revokeBurn(address _requestor, uint256 _index) public onlyAdmin {
        delete burnRequestOperations[_requestor][_index];
        emit BurnOperationRevoked(_requestor, msg.sender, block.timestamp, _index);
    }

    function pauseOperations() public onlyOwner {
        operationsPaused = true;
    }

    function unpauseOperations() public onlyOwner {
        operationsPaused = false;
    }

    function sweepToken(address _from, address _to, uint256 _value) public onlyOwner {
        TokenInterface(token).sweep(msg.sender, _from, _to, _value);
    }

    function pauseToken() public onlyOwner {
        TokenInterface(token).pause();
    }

    function unpauseToken() public onlyOwner {
        TokenInterface(token).unpause();
    }
}