pragma solidity ^0.4.24;

import "../modules/ModularToken";

contract ComplianceLayer is ModularToken {
    function burn(uint256 _value, string _note) public onlyOwner returns (bool) {
        require(registryModule);
        super.burn(_value, _note);
    }

    function mint(address _to, uint256 _value) public onlyOwner returns (bool) {
        require(registryModule);
        super.mint(_to, _value);
    }
}