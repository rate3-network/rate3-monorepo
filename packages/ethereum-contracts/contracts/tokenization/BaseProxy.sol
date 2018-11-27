pragma solidity 0.4.24;

import "./proxies/ERC20Proxy.sol";
import "./proxies/AdminProxy.sol";

contract BaseProxy is ERC20Proxy {
    constructor(
        address _token
    )
        public
        AdminProxy(_token)
    {

    }
}