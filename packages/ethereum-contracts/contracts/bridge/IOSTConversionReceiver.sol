pragma solidity 0.4.24;

import "../lib/ownership/Claimable.sol";
import "../lib/lifecycle/Pausable.sol";
import "../lib/math/SafeMath.sol";
import "../tokenization/interfaces/ERC20.sol";

contract IOSTConversionReceiver is Claimable, Pausable {
    using SafeMath for uint256;

    ERC20 public token;
    ERC20 public discountToken;
    uint256 public discountThreshold;
    uint256 public conversionFeeBasisPoints;
    uint256 public unlockFeeBasisPoints;
    uint256 public discountedConversionFeeBasisPoints;
    uint256 public discountedUnlockFeeBasisPoints;
    uint256 public minimumConversionAmount;
    address public feeCollectionWallet;
    address public coldStorageWallet;
    Conversion[] public conversions;
    uint256 public totalLockedTokens;
    uint256 public fees;

    struct Conversion {
        address ethAddress;
        string iostAccount;
        uint256 amount;
        uint256 fee;
        uint256 netAmount;
        bool discounted;
        States state;
    }

    enum States {
        INVALID,
        OPEN,
        ACCEPTED,
        REJECTED
    }

    event ConversionRequested(
        uint256 indexID,
        address indexed ethAddress,
        string iostAccount,
        uint256 amount,
        uint256 fee,
        uint256 netAmount,
        bool discounted,
        uint256 requestTimestamp
    );
    event ConversionRejected(
        uint256 indexID,
        address indexed ethAddress,
        string iostAccount,
        uint256 amount,
        uint256 fee,
        uint256 netAmount,
        bool discounted,
        uint256 rejectTimestamp
    );
    event ConversionAccepted(
        uint256 indexID,
        address indexed ethAddress,
        string iostAccount,
        uint256 amount,
        uint256 fee,
        uint256 netAmount,
        bool discounted,
        uint256 acceptTimestamp
    );
    event ConversionUnlocked(
        address indexed ethAddress,
        string iostAccount,
        string iostMirrorTransactionHash,
        uint256 amount,
        uint256 fee,
        uint256 netAmount,
        bool discounted,
        uint256 unlockTimestamp
    );
    event CollectedFees(address feeCollectionWallet, uint256 amount, uint256 collectionTimestamp);
    event SentTokensToColdStorage(address coldStorageAddress, uint256 amount, uint256 storageTimestamp);
    
    modifier onlyOpenConversions(uint256 _index) {
        require(conversions[_index].state == States.OPEN, "Conversion should be open");
        _;
    }

    constructor(
        ERC20 _token,
        ERC20 _discountToken,
        uint256 _discountThreshold,
        uint256 _conversionFeeBasisPoints,
        uint256 _unlockFeeBasisPoints,
        uint256 _discountedConversionFeeBasisPoints,
        uint256 _discountedUnlockFeeBasisPoints,
        uint256 _minimumConversionAmount,
        address _feeCollectionWallet,
        address _coldStorageWallet
    ) public {
        token = _token;
        discountToken = _discountToken;
        discountThreshold = _discountThreshold;
        conversionFeeBasisPoints = _conversionFeeBasisPoints;
        unlockFeeBasisPoints = _unlockFeeBasisPoints;
        discountedConversionFeeBasisPoints = _discountedConversionFeeBasisPoints;
        discountedUnlockFeeBasisPoints = _discountedUnlockFeeBasisPoints;
        minimumConversionAmount = _minimumConversionAmount;
        feeCollectionWallet = _feeCollectionWallet;
        coldStorageWallet = _coldStorageWallet;
    }

    // Owner functions, only when contract is paused
    function setDiscountToken(ERC20 _discountToken) public onlyOwner whenPaused {
        discountToken = _discountToken;
    }

    function setDiscountThreshold(uint256 _threshold) public onlyOwner whenPaused {
        discountThreshold = _threshold;
    }

    function setConversionFeeBasisPoints(uint256 _bp) public onlyOwner whenPaused {
        conversionFeeBasisPoints = _bp;
    }

    function setUnlockFeeBasisPoints(uint256 _bp) public onlyOwner whenPaused {
        unlockFeeBasisPoints = _bp;
    }

    function setDiscountedConversionFeeBasisPoints(uint256 _bp) public onlyOwner whenPaused {
        require(_bp <= conversionFeeBasisPoints, "Discount cannot be higher than non-discounted rate");
        discountedConversionFeeBasisPoints = _bp;
    }

    function setDiscountedUnlockFeeBasisPoints(uint256 _bp) public onlyOwner whenPaused {
        require(_bp <= unlockFeeBasisPoints, "Discount cannot be higher than non-discounted rate");
        discountedUnlockFeeBasisPoints = _bp;
    }

    function setMinimumConversionAmount(uint256 _amount) public onlyOwner whenPaused {
        minimumConversionAmount = _amount;
    }

    function setFeeCollectionWallet(address _wallet) public onlyOwner whenPaused {
        feeCollectionWallet = _wallet;
    }

    function setColdStorageWallet(address _wallet) public onlyOwner whenPaused {
        coldStorageWallet = _wallet;
    }

    function requestConversion(
        uint256 _amount,
        string _iostAccount
    )
        public
        whenNotPaused
    {
        require(_amount >= minimumConversionAmount, "Should be above minimum conversion amount");
        require(_amount <= token.allowance(msg.sender, address(this)), "Allowance should be set");
        
        uint256 index = conversions.length;

        uint256 fee = 0;
        bool discounted = (discountToken.balanceOf(msg.sender) >= discountThreshold);
        // Check whether discounted fee or normal fee.
        if (discounted) {
            fee = (_amount.mul(discountedConversionFeeBasisPoints)).div(10000);
        } else {
            fee = (_amount.mul(conversionFeeBasisPoints)).div(10000);
        }

        uint256 netAmount = _amount.sub(fee);

        conversions.push(
            Conversion(
                msg.sender,
                _iostAccount,
                _amount,
                fee,
                netAmount,
                discounted,
                States.OPEN
            )
        );

        // Transfer total amount to conversion contract.
        require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");

        emit ConversionRequested(index, msg.sender, _iostAccount, _amount, fee, netAmount, discounted, block.timestamp);
    }

    function rejectConversion(uint256 _index) public onlyOwner whenNotPaused onlyOpenConversions(_index) {
        Conversion storage conversion = conversions[_index];
        require(token.transfer(conversion.ethAddress, conversion.amount), "Token transfer failed");
        conversion.state = States.REJECTED;

        emit ConversionRejected(
            _index,
            conversion.ethAddress,
            conversion.iostAccount,
            conversion.amount,
            conversion.fee,
            conversion.netAmount,
            conversion.discounted,
            block.timestamp
        );
    }

    function acceptConversion(uint256 _index) public onlyOwner whenNotPaused onlyOpenConversions(_index) {
        Conversion storage conversion = conversions[_index];
        conversion.state = States.ACCEPTED;

        // Add net amount to locked tokens.
        totalLockedTokens = totalLockedTokens.add(conversion.netAmount);
        // Add fee to total fees collected.
        fees = fees.add(conversion.fee);

        emit ConversionAccepted(
            _index,
            conversion.ethAddress,
            conversion.iostAccount,
            conversion.amount,
            conversion.fee,
            conversion.netAmount,
            conversion.discounted,
            block.timestamp
        );
    }

    function unlockConversion(
        uint256 _amount,
        address _ethAddress,
        string _iostAccount,
        string _iostMirrorTransactionHash
    )
        public
        onlyOwner
        whenNotPaused
    {
        require(_amount >= minimumConversionAmount, "Should be above minimum conversion amount");
        require(_amount <= totalLockedTokens, "Not enough tokens to convert");

        uint256 fee = 0;
        bool discounted = (discountToken.balanceOf(_ethAddress) >= discountThreshold);
        // Check whether discounted fee or normal fee.
        if (discounted) {
            fee = (_amount.mul(discountedUnlockFeeBasisPoints)).div(10000);
        } else {
            fee = (_amount.mul(unlockFeeBasisPoints)).div(10000);
        }

        uint256 netAmount = _amount.sub(fee);
        // Remove total amount from locked tokens.
        totalLockedTokens = totalLockedTokens.sub(_amount);
        // Add fee to total fees collected.
        fees = fees.add(fee);

        // Transfer (amount - fees) to destination address.
        require(token.transfer(_ethAddress, netAmount), "Token transfer failed");

        emit ConversionUnlocked(
            _ethAddress,
            _iostAccount,
            _iostMirrorTransactionHash,
            _amount,
            fee,
            netAmount,
            discounted,
            block.timestamp
        );
    }

    function collectFees() public onlyOwner {
        uint256 amount = fees;
        // Clear fees first *important*;
        fees = 0;
        require(token.transfer(feeCollectionWallet, amount), "Token transfer failed");
        emit CollectedFees(feeCollectionWallet, amount, block.timestamp);
    }

    function sendTokensToColdStorage(uint256 _amount) public onlyOwner whenPaused {
        require(token.transfer(coldStorageWallet, _amount), "Token transfer failed");
        emit SentTokensToColdStorage(coldStorageWallet, _amount, block.timestamp);
    }
}