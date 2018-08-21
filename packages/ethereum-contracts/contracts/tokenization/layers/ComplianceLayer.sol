pragma solidity ^0.4.24;

import "../modules/ModularToken.sol";

contract ComplianceLayer is ModularToken {
    function burn(address _from, uint256 _value) public onlyOwner returns (bool) {
        //require(registryModule);
        super.burn(_from, _value);
    }

    function mint(address _to, uint256 _value) public onlyOwner returns (bool) {
        //require(registryModule);
        super.mint(_to, _value);
    }
}