pragma solidity 0.4.24;

import "../tokenization/interfaces/ERC20.sol";

contract HashedTimelockSwaps {
    struct Swap {
        uint256 timelock;
        uint256 erc20Value;
        address erc20Trader;
        address erc20ContractAddress;
        address withdrawTrader;
        bytes32 secretLock;
        bytes secretKey;
    }

    enum States {
        INVALID,
        OPEN,
        CLOSED,
        EXPIRED
    }

    mapping (bytes32 => Swap) private swaps;
    mapping (bytes32 => States) private swapStates;

    event Open(bytes32 _swapID, address _withdrawTrader,bytes32 _secretLock);
    event Expire(bytes32 _swapID);
    event Close(bytes32 _swapID, bytes _secretKey);

    modifier onlyInvalidSwaps(bytes32 _swapID) {
        require(swapStates[_swapID] == States.INVALID, "Swap should be invalid.");
        _;
    }

    modifier onlyOpenSwaps(bytes32 _swapID) {
        require(swapStates[_swapID] == States.OPEN, "Swap should be open.");
        _;
    }

    modifier onlyClosedSwaps(bytes32 _swapID) {
        require(swapStates[_swapID] == States.CLOSED, "Swap should be closed.");
        _;
    }

    modifier onlyExpirableSwaps(bytes32 _swapID) {
        require(swaps[_swapID].timelock <= block.timestamp, "Swap is not yet expired.");
        _;
    }

    modifier onlyWithSecretKey(bytes32 _swapID, bytes _secretKey) {
        require(swaps[_swapID].secretLock == sha256(_secretKey), "Secret key invalid.");
        _;
    }

    function open(
        bytes32 _swapID,
        uint256 _erc20Value,
        address _erc20ContractAddress,
        address _withdrawTrader,
        bytes32 _secretLock,
        uint256 _timelock
    )
        public
        onlyInvalidSwaps(_swapID)
    {
        // Transfer value from the ERC20 trader to this contract.
        ERC20 erc20Contract = ERC20(_erc20ContractAddress);
        require(_erc20Value <= erc20Contract.allowance(msg.sender, address(this)), "Allowance should be set.");
        require(erc20Contract.transferFrom(msg.sender, address(this), _erc20Value), "Token transfer failed.");

        // Store the details of the swap.
        Swap memory swap = Swap({
            timelock: _timelock,
            erc20Value: _erc20Value,
            erc20Trader: msg.sender,
            erc20ContractAddress: _erc20ContractAddress,
            withdrawTrader: _withdrawTrader,
            secretLock: _secretLock,
            secretKey: new bytes(0)
        });

        swaps[_swapID] = swap;
        swapStates[_swapID] = States.OPEN;
        emit Open(_swapID, _withdrawTrader, _secretLock);
    }

    function close(
        bytes32 _swapID,
        bytes _secretKey
    )
        public
        onlyOpenSwaps(_swapID)
        onlyWithSecretKey(_swapID, _secretKey)
    {
        // TODO: Consider checking for expiration and deny close.
        // Close the swap.
        Swap memory swap = swaps[_swapID];
        swaps[_swapID].secretKey = _secretKey;
        swapStates[_swapID] = States.CLOSED;

        // Transfer the ERC20 funds from this contract to the withdrawing trader.
        ERC20 erc20Contract = ERC20(swap.erc20ContractAddress);
        require(erc20Contract.transfer(swap.withdrawTrader, swap.erc20Value), "Token transfer failed.");

        emit Close(_swapID, _secretKey);
    }

    function expire(
        bytes32 _swapID
    )
        public
        onlyOpenSwaps(_swapID)
        onlyExpirableSwaps(_swapID)
    {
        // Expire the swap.
        Swap memory swap = swaps[_swapID];
        swapStates[_swapID] = States.EXPIRED;

        // Transfer the ERC20 value from this contract back to the ERC20 trader.
        ERC20 erc20Contract = ERC20(swap.erc20ContractAddress);
        require(erc20Contract.transfer(swap.erc20Trader, swap.erc20Value), "Token transfer failed.");

        emit Expire(_swapID);
    } 

    function check(
        bytes32 _swapID
    )
        public
        view
        returns
    (
        uint256 timelock,
        uint256 erc20Value,
        address erc20ContractAddress,
        address withdrawTrader,
        bytes32 secretLock
    )
    
    {
        Swap memory swap = swaps[_swapID];
        return (
            swap.timelock, 
            swap.erc20Value, 
            swap.erc20ContractAddress, 
            swap.withdrawTrader,
            swap.secretLock
        );
    }

    function checkSecretKey(
        bytes32 _swapID
    )
        public
        view
        onlyClosedSwaps(_swapID) 
        returns (bytes secretKey)
    {
        Swap memory swap = swaps[_swapID];
        return swap.secretKey;
    }
}