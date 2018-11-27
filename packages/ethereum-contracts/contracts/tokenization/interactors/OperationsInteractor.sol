pragma solidity 0.4.24;

import "../interfaces/TokenInterface.sol";
import "../interfaces/ERC20.sol";
import "./AdminInteractor.sol";

/**
 * @title For tokenization operations such as minting and burning of tokens.
 *
 * @notice Operations flow: Request -> Approval by first admin -> Finalize by second admin
 */
contract OperationsInteractor is AdminInteractor {
    /**
     * @notice MintRequestOperation keeps track of the state of a requested
     * mint, and updated accordingly during approval and finalization stages.
     */
    struct MintRequestOperation {
        address by;
        uint256 value;
        OperationStates status;
        uint256 requestTimestamp;
        address approvedBy;
        uint256 approvedTimestamp;
        address finalizedBy;
        uint256 finalizedTimestamp;
        address revokedBy;
        uint256 revokedTimestamp;
    }

    /**
     * @notice BurnRequestOperation keeps track of the state of a requested
     * burn, and updated accordingly during approval and finalization stages.
     */
    struct BurnRequestOperation {
        address by;
        uint256 value;
        OperationStates status;
        uint256 requestTimestamp;
        address approvedBy;
        uint256 approvedTimestamp;
        address finalizedBy;
        uint256 finalizedTimestamp;
        address revokedBy;
        uint256 revokedTimestamp;
    }

    enum OperationStates {
        INVALID,
        REQUESTED,
        APPROVED,
        FINALIZED,
        REVOKED
    }

    /// @notice Each address has an array of MintRequestOperations in order.
    mapping (address => MintRequestOperation[]) public mintRequestOperations;

    /// @notice Each address has an array of BurnRequestOperations in order.
    mapping (address => BurnRequestOperation[]) public burnRequestOperations;

    /// @notice Pause all operations except Owner functionalities and revoke.
    bool public operationsPaused;

    /// @notice Only when operations are not paused.
    modifier operationsNotPaused() {
        require(!operationsPaused, "Operations are paused");
        _;
    }

    /**
     * @notice Check if address is cleared for minting.
     *
     * @param _mintDestinationAddress Destination address to mint tokens to.
     */
    modifier whitelistedForMint(address _mintDestinationAddress) {
        require(TokenInterface(token).isWhitelistedForMint(_mintDestinationAddress), "Not whitelisted for mint");
        _;
    }

    /**
     * @notice Check if address is cleared for burning.
     *
     * @param _burnOriginAddress Destination address to burn tokens from.
     */
    modifier whitelistedForBurn(address _burnOriginAddress) {
        require(TokenInterface(token).isWhitelistedForBurn(_burnOriginAddress), "Not whitelisted for burn");
        _;
    }

    /**
     * @notice Check if requestor address is not blacklisted.
     *
     * @param _requestorAddress Requestor address.
     */
    modifier notBlacklistedForRequest(address _requestorAddress) {
        require(!TokenInterface(token).isBlacklisted(_requestorAddress), "Blacklisted");
        _;
    }

    /// Events
    event MintOperationRequested(address indexed by, uint256 value, uint256 requestTimestamp, uint256 index);
    event BurnOperationRequested(
        address indexed by,
        uint256 value,
        uint256 requestTimestamp,
        uint256 index,
        uint256 beforeTotalSupply,
        uint256 afterTotalSupply,
        uint256 beforeUserBalance,
        uint256 afterUserBalance
    );

    event MintOperationApproved(address indexed by, uint256 value, address indexed approvedBy, uint256 approvedTimestamp, uint256 index);
    event BurnOperationApproved(address indexed by, uint256 value, address indexed approvedBy, uint256 approvedTimestamp, uint256 index);

    event MintOperationFinalized(
        address indexed by,
        uint256 value,
        address indexed finalizedBy,
        uint256 finalizedTimestamp,
        uint256 index,
        uint256 beforeTotalSupply,
        uint256 afterTotalSupply,
        uint256 beforeUserBalance,
        uint256 afterUserBalance
    );
    event BurnOperationFinalized(address indexed by, uint256 value, address indexed finalizedBy, uint256 finalizedTimestamp, uint256 index);

    event MintOperationRevoked(address indexed by, uint256 value, address indexed revokedBy, uint256 revokedTimestamp, uint256 index);
    event BurnOperationRevoked(
        address indexed by,
        uint256 value,
        address indexed revokedBy,
        uint256 revokedTimestamp,
        uint256 index,
        uint256 beforeTotalSupply,
        uint256 afterTotalSupply,
        uint256 beforeUserBalance,
        uint256 afterUserBalance
    );

    /**
     * @notice Request mint, fires off a MintOperationRequested event.

     *
     * @param _value Amount of tokens to mint.
     */
    function requestMint(uint256 _value) public operationsNotPaused whitelistedForMint(msg.sender) notBlacklistedForRequest(msg.sender) {
        require(_value > 0, "Mint value should be more than 0");

        uint256 requestTimestamp = block.timestamp;
        MintRequestOperation memory mintRequestOperation = MintRequestOperation(
            msg.sender,
            _value,
            OperationStates.REQUESTED,
            requestTimestamp,
            address(0),
            0,
            address(0),
            0,
            address(0),
            0
        );

        // Record and emit index of operation before pushing to array.
        emit MintOperationRequested(msg.sender, _value, requestTimestamp, mintRequestOperations[msg.sender].length);

        mintRequestOperations[msg.sender].push(mintRequestOperation);
    }

    /**
     * @notice Approve mint, fires off a MintOperationApproved event.
     *
     * @dev Can only be approved by Admin 1.
     *
     * @param _requestor Requestor of MintRequestOperation.
     * @param _index Index of MintRequestOperation by _requestor.
     */
    function approveMint(
        address _requestor,
        uint256 _index
    )
        public
        onlyAdmin1
        operationsNotPaused
        whitelistedForMint(_requestor)
        notBlacklistedForRequest(_requestor)
    {
        MintRequestOperation storage mintRequestOperation = mintRequestOperations[_requestor][_index];

        require(mintRequestOperation.status == OperationStates.REQUESTED, "MintRequestOperation is not at REQUESTED state");

        mintRequestOperation.status = OperationStates.APPROVED;
        mintRequestOperation.approvedBy = msg.sender;
        mintRequestOperation.approvedTimestamp = block.timestamp;

        emit MintOperationApproved(_requestor, mintRequestOperation.value, msg.sender, block.timestamp, _index);
    }

    /**
     * @notice Finalize mint, fires off a MintOperationFinalized event. Tokens
     * will be minted.
     *
     * @dev Can only be approved by Admin 2. MintRequestOperation should be
     * already approved beforehand.
     *
     * @param _requestor Requestor of MintRequestOperation.
     * @param _index Index of MintRequestOperation by _requestor.
     */
    function finalizeMint(
        address _requestor,
        uint256 _index
    ) 
        public
        onlyAdmin2
        operationsNotPaused
        whitelistedForMint(_requestor)
        notBlacklistedForRequest(_requestor)
    {
        MintRequestOperation storage mintRequestOperation = mintRequestOperations[_requestor][_index];

        require(mintRequestOperation.status == OperationStates.APPROVED, "MintRequestOperation is not at APPROVED state");

        address mintAddress = mintRequestOperation.by;
        uint256 value = mintRequestOperation.value;

        mintRequestOperation.status = OperationStates.FINALIZED;
        mintRequestOperation.finalizedBy = msg.sender;
        mintRequestOperation.finalizedTimestamp = block.timestamp;

        uint256 beforeTotalSupply = ERC20(token).totalSupply();
        uint256 beforeUserBalance = ERC20(token).balanceOf(mintAddress);

        TokenInterface(token).mint(mintAddress, value);

        uint256 afterTotalSupply = ERC20(token).totalSupply();
        uint256 afterUserBalance = ERC20(token).balanceOf(mintAddress);

        emit MintOperationFinalized(
            _requestor,
            mintRequestOperation.value,
            msg.sender,
            block.timestamp,
            _index,
            beforeTotalSupply,
            afterTotalSupply,
            beforeUserBalance,
            afterUserBalance
        );
    }

    /**
     * @notice Revokes a specific MintRequest.
     *
     * @dev Can only be approved by Admin 1 or Admin 2.
     *
     * @param _requestor Requestor of MintRequestOperation.
     * @param _index Index of MintRequestOperation by _requestor.
     */
    function revokeMint(
        address _requestor,
        uint256 _index
    )
        public
        onlyAdmin
        operationsNotPaused
    {
        MintRequestOperation storage mintRequestOperation = mintRequestOperations[_requestor][_index];

        require(mintRequestOperation.status != OperationStates.FINALIZED, "MintRequestOperation is already FINALIZED");
        require(mintRequestOperation.status != OperationStates.REVOKED, "MintRequestOperation is already REVOKED");

        mintRequestOperation.status = OperationStates.REVOKED;
        mintRequestOperation.revokedBy = msg.sender;
        mintRequestOperation.revokedTimestamp = block.timestamp;

        emit MintOperationRevoked(_requestor, mintRequestOperation.value, msg.sender, block.timestamp, _index);
    }

    /**
     * @notice Revoke a specific MintRequest from the original requestor.
     *
     * @dev Can only be revoked by original MintRequest requestor. Can only be
     * done if MintRequest is not already APPROVED.
     *
     * @param _index Index of MintRequestOperation by requestor.
     */
    function userRevokeMint(
        uint256 _index
    )
        public
        operationsNotPaused
    {
        MintRequestOperation storage mintRequestOperation = mintRequestOperations[msg.sender][_index];

        require(mintRequestOperation.by == msg.sender, "MintRequestOperation can only be userRevoked by original requestor");

        require(mintRequestOperation.status != OperationStates.APPROVED, "MintRequestOperation is already APPROVED");
        require(mintRequestOperation.status != OperationStates.FINALIZED, "MintRequestOperation is already FINALIZED");
        require(mintRequestOperation.status != OperationStates.REVOKED, "MintRequestOperation is already REVOKED");

        mintRequestOperation.status = OperationStates.REVOKED;
        mintRequestOperation.revokedBy = msg.sender;
        mintRequestOperation.revokedTimestamp = block.timestamp;

        emit MintOperationRevoked(msg.sender, mintRequestOperation.value, msg.sender, block.timestamp, _index);
    }

    /**
     * @notice Request burn, fires off a BurnOperationRequested event. Tokens
     * will be burned at this point.
     *
     * @param _value Number of tokens to burn.
     */
    function requestBurn(uint256 _value) public operationsNotPaused whitelistedForBurn(msg.sender) notBlacklistedForRequest(msg.sender) {
        require(_value > 0, "Burn value should be more than 0");

        uint256 requestTimestamp = block.timestamp;
        BurnRequestOperation memory burnRequestOperation = BurnRequestOperation(
            msg.sender,
            _value,
            OperationStates.REQUESTED,
            requestTimestamp,
            address(0),
            0,
            address(0),
            0,
            address(0),
            0
        );

        uint256 beforeTotalSupply = ERC20(token).totalSupply();
        uint256 beforeUserBalance = ERC20(token).balanceOf(msg.sender);
        require(beforeUserBalance >= _value, "Insufficient balance to request");

        // Burn tokens. Can be reversed later if request is revoked.
        TokenInterface(token).burn(msg.sender, _value);

        uint256 afterTotalSupply = ERC20(token).totalSupply();
        uint256 afterUserBalance = ERC20(token).balanceOf(msg.sender);

        // Record and emit index of operation before pushing to array.
        emit BurnOperationRequested(
            msg.sender,
            _value,
            requestTimestamp,
            burnRequestOperations[msg.sender].length,
            beforeTotalSupply,
            afterTotalSupply,
            beforeUserBalance,
            afterUserBalance
        );

        burnRequestOperations[msg.sender].push(burnRequestOperation);
    }

    /**
     * @notice Approve burn, fires off a BurnOperationApproved event.
     *
     * @dev Can only be approved by Admin 1.
     *
     * @param _requestor Requestor of BurnRequestOperation.
     * @param _index Index of BurnRequestOperation by _requestor.
     */
    function approveBurn(
        address _requestor,
        uint256 _index
    )
        public
        onlyAdmin2
        operationsNotPaused
        whitelistedForBurn(_requestor)
        notBlacklistedForRequest(_requestor)
    {
        BurnRequestOperation storage burnRequestOperation = burnRequestOperations[_requestor][_index];

        require(burnRequestOperation.status == OperationStates.REQUESTED, "BurnRequestOperation is not at REQUESTED state");

        burnRequestOperation.status = OperationStates.APPROVED;
        burnRequestOperation.approvedBy = msg.sender;
        burnRequestOperation.approvedTimestamp = block.timestamp;

        emit BurnOperationApproved(_requestor, burnRequestOperation.value, msg.sender, block.timestamp, _index);
    }

    /**
     * @notice Finalize burn, fires off a BurnOperationFinalized event.
     *
     * @dev Can only be approved by Admin 2. BurnRequestOperation should be
     * already approved beforehand.
     *
     * @param _requestor Requestor of BurnRequestOperation.
     * @param _index Index of BurnRequestOperation by _requestor.
     */
    function finalizeBurn(
        address _requestor,
        uint256 _index
    )
        public
        onlyAdmin1
        operationsNotPaused
        whitelistedForBurn(_requestor)
        notBlacklistedForRequest(_requestor)
    {
        BurnRequestOperation storage burnRequestOperation = burnRequestOperations[_requestor][_index];

        require(burnRequestOperation.status == OperationStates.APPROVED, "BurnRequestOperation is not at APPROVED state");

        burnRequestOperation.status = OperationStates.FINALIZED;
        burnRequestOperation.finalizedBy = msg.sender;
        burnRequestOperation.finalizedTimestamp = block.timestamp;

        emit BurnOperationFinalized(_requestor, burnRequestOperation.value, msg.sender, block.timestamp, _index);
    }

    /**
     * @notice Revokes a specific BurnRequest.
     *
     * @dev Can only be approved by Admin 1 or Admin 2.
     *
     * @param _requestor Requestor of BurnRequestOperation.
     * @param _index Index of BurnRequestOperation by _requestor.
     */
    function revokeBurn(
        address _requestor,
        uint256 _index
    )
        public
        onlyAdmin
        operationsNotPaused
        whitelistedForMint(_requestor)
        notBlacklistedForRequest(_requestor)
    {
        BurnRequestOperation storage burnRequestOperation = burnRequestOperations[_requestor][_index];

        require(burnRequestOperation.status != OperationStates.FINALIZED, "BurnRequestOperation is already FINALIZED");
        require(burnRequestOperation.status != OperationStates.REVOKED, "BurnRequestOperation is already REVOKED");

        burnRequestOperation.status = OperationStates.REVOKED;
        burnRequestOperation.revokedBy = msg.sender;
        burnRequestOperation.revokedTimestamp = block.timestamp;
        
        uint256 beforeTotalSupply = ERC20(token).totalSupply();
        uint256 beforeUserBalance = ERC20(token).balanceOf(burnRequestOperation.by);

        // Return back the tokens. Note that this will fail if user is not whitelisted for mint, or blacklisted.
        TokenInterface(token).mint(burnRequestOperation.by, burnRequestOperation.value);

        uint256 afterTotalSupply = ERC20(token).totalSupply();
        uint256 afterUserBalance = ERC20(token).balanceOf(burnRequestOperation.by);

        emit BurnOperationRevoked(
            _requestor,
            burnRequestOperation.value,
            msg.sender,
            block.timestamp,
            _index,
            beforeTotalSupply,
            afterTotalSupply,
            beforeUserBalance,
            afterUserBalance
        );
    }

    /**
     * @notice Revoke a specific BurnRequest from the original requestor.
     *
     * @dev Can only be revoked by original BurnRequest requestor. Can only be
     * done if BurnRequest is not already APPROVED.
     *
     * @param _index Index of BurnRequestOperation by requestor.
     */
    function userRevokeBurn(
        uint256 _index
    ) 
        public
        operationsNotPaused
        whitelistedForMint(msg.sender)
        notBlacklistedForRequest(msg.sender)
    {
        BurnRequestOperation storage burnRequestOperation = burnRequestOperations[msg.sender][_index];

        require(burnRequestOperation.by == msg.sender, "BurnRequestOperation can only be userRevoked by original requestor");

        require(burnRequestOperation.status != OperationStates.APPROVED, "BurnRequestOperation is already APPROVED");
        require(burnRequestOperation.status != OperationStates.FINALIZED, "BurnRequestOperation is already FINALIZED");
        require(burnRequestOperation.status != OperationStates.REVOKED, "BurnRequestOperation is already REVOKED");

        burnRequestOperation.status = OperationStates.REVOKED;
        burnRequestOperation.revokedBy = msg.sender;
        burnRequestOperation.revokedTimestamp = block.timestamp;

        uint256 beforeTotalSupply = ERC20(token).totalSupply();
        uint256 beforeUserBalance = ERC20(token).balanceOf(burnRequestOperation.by);

        // Return back the tokens. Note that this will fail if user is not whitelisted for mint, or blacklisted.
        TokenInterface(token).mint(burnRequestOperation.by, burnRequestOperation.value);

        uint256 afterTotalSupply = ERC20(token).totalSupply();
        uint256 afterUserBalance = ERC20(token).balanceOf(burnRequestOperation.by);

        emit BurnOperationRevoked(
            msg.sender,
            burnRequestOperation.value,
            msg.sender,
            block.timestamp,
            _index,
            beforeTotalSupply,
            afterTotalSupply,
            beforeUserBalance,
            afterUserBalance
        );
    }

    /**
     * @notice Sweep a set amount of tokens from a particular address and send
     * them to a holding account.
     *
     * @dev Useful when retrieving lost tokens or confiscation of tokens due to
     * suspicious activities. Only Owner of interactor is allowed to do this.
     *
     * @param _from Account to sweep tokens from.
     * @param _to Account to hold tokens on.
     * @param _value Amount of tokens to sweep.
     */
    function sweepToken(address _from, address _to, uint256 _value) public onlyOwner {
        TokenInterface(token).sweep(msg.sender, _from, _to, _value);
    }

    /// @notice Pause operations for this interactor.
    function pauseOperations() public onlyOwner {
        operationsPaused = true;
    }

    /// @notice Resume operations for this interactor.
    function unpauseOperations() public onlyOwner {
        operationsPaused = false;
    }

    /// @notice Globally pause token ERC20 functionality.
    function pauseToken() public onlyOwner {
        TokenInterface(token).pause();
    }

    /// @notice Globally resume token ERC20 functionality.
    function unpauseToken() public onlyOwner {
        TokenInterface(token).unpause();
    }
}