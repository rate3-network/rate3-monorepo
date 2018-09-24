pragma solidity ^0.4.24;

import "./interactors/RegistryInteractor.sol";
import "./interactors/OperationsInteractor.sol";

contract BaseInteractor is OperationsInteractor, RegistryInteractor {
    constructor(
        address _token,
        address _proxy
    ) 
        public
        BaseInteractor(_token, _proxy)
    {
        
    }
}