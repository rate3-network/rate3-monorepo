pragma solidity ^0.4.24;

contract Multisig2of3OwnerInteractor {
    /**
     * Storage
     */

    mapping(address => bool) public isOwner;
    address[3] public owners;
    Transaction public currentPendingTransaction;
    mapping(address => bool) public confirmations;

    struct Transaction {
        bytes data;
        bytes32 dataHash;
        bool pending;
        uint256 confirmationCount;
    }

    /**
     * Events
     */

    /**
     * Modifiers
     */

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Only one of the owners is allowed");
        _;
    }

    modifier noPendingTransaction() {
        require(!currentPendingTransaction.pending, "There is already a pending transaction");
        _;
    }

    modifier hasPendingTransaction() {
        require(currentPendingTransaction.pending, "There is no pending transaction");
        _;
    }

    modifier notConfirmedTransaction() {
        require(!confirmations[msg.sender], "Owner has already confirmed transaction");
        _;
    }

    modifier hasConfirmedTransaction() {
        require(confirmations[msg.sender], "Owner has not confirmed transaction");
        _;
    }

    modifier hashMatches(bytes32 _hash) {
        require(_hash == currentPendingTransaction.dataHash, "Data hash do not match");
        _;
    }


    /**
     * @dev Contract constructor that sets 3 initial owners
     * @param _owners List of initial owners
     */
    constructor(address[3] _owners) public {
        isOwner[_owners[0]] = true;
        isOwner[_owners[1]] = true;
        isOwner[_owners[2]] = true;
        owners[0] = _owners[0];
        owners[1] = _owners[1];
        owners[2] = _owners[2];
    }

    function confirmTransaction()
        public
        onlyOwner
        hasPendingTransaction
        notConfirmedTransaction
    {
        confirmations[msg.sender] = true;
        currentPendingTransaction.confirmationCount += 1;
    }

    function executeTransaction(bytes32 _hash)
        public
        onlyOwner
        hasPendingTransaction {

    }

    function revokeTransaction(uint256 _hash)
        public
        onlyOwner
        hasPendingTransaction
        hasConfirmedTransaction
    {
        confirmations[msg.sender] = false;
        currentPendingTransaction.confirmationCount -= 1;

        if (currentPendingTransaction.confirmationCount == 0) {
            _removeTransaction();
        }
    }

    /**
     * Internal functions
     */
    
    function _addTransaction()
        internal
        noPendingTransaction
    {
        currentPendingTransaction = Transaction({
            data: msg.data,
            dataHash: keccak256(msg.data),
            pending: true,
            confirmationCount: 1
        });
    }

    function _removeTransaction()
        internal
        hasPendingTransaction
    {
        delete currentPendingTransaction;
        delete confirmations[owners[0]];
        delete confirmations[owners[1]];
        delete confirmations[owners[2]];
    }

    /**
     * External functions
     */
    function setToken(address _newTokenContract) public onlyOwner {
        _addTransaction();
    }

    function setFirstAdmin(address _newAdminAddress) public onlyOwner {
        _addTransaction();
    }

    function setSecondAdmin(address _newAdminAddress) public onlyOwner {
        _addTransaction();
    }

}