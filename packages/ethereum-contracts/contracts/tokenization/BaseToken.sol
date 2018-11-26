pragma solidity ^0.4.24;

import "./tokens/CompliantToken.sol";
import "./tokens/ProxySupportedERC20Token.sol";

contract BaseToken is CompliantToken, ProxySupportedERC20Token {
    constructor(
        string _name,
        string _symbol,
        uint8 _decimals
    ) 
        public
        ModularToken(_name, _symbol, _decimals)
    {
        
    }
}