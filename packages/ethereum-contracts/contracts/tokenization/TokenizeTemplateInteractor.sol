pragma solidity ^0.4.24;

import "./interactors/RegistryInteractor.sol";
import "./interactors/OperationsInteractor.sol";

contract TokenizeTemplateInteractor is OperationsInteractor, RegistryInteractor {
    constructor(
        TokenizeTemplateToken _token
    ) 
        public
        BaseAdminInteractor(_token)
    {
        
    }
}