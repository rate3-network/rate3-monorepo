pragma solidity ^0.4.24;

import "./proxies/ERC20Proxy.sol";
import "./proxies/AdminProxy.sol";

contract BaseProxy is ERC20Proxy {
    constructor(
        address _token,
        string _name,
        string _symbol,
        uint8 _decimals
    )
        public
        AdminProxy(_token)
        ERC20Proxy(_name, _symbol, _decimals)
    {

    }
}