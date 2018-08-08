pragma solidity ^0.4.24;

import "../lib/math/SafeMath.sol";
import "./modules/ModularToken.sol";

contract TokenizeTemplateToken is ModularToken {
    using SafeMath for uint256;

    string public name = "";
    string public symbol = "TUSD";
    uint8 public constant decimals = 18;

    constructor() public {
        totalSupply_ = 0;
    }
}