# tokenization
Template contracts to create tokens based on the Rate3 tokenization protocol

## Components
There are five main components to the tokenization protocol:

* Interactor
* Proxy
* Token
* Module
* Interface

### Interactor
Interactors are contracts that oversees the operation and administration of the token. Operations include mint and burn 
operations that affect the token supply, whitelisting and blacklisting based on the needs of the token.

It can also serve as a layer for actions that need more than one signature approval, as well as handle the ownership
of the token contracts.

### Proxy
Proxy contracts forward transactions to contracts with the actual implementation.

This way, the implementation contract can be easily upgraded without causing a change in contract address that 
external users interfaces with.

### Token
Token contracts are the implementation of the token state and methods. Token standards (such as ERC20 or ERC777) are
implemented here.

Additional checks such as adding KYC/AML whitelisting to access token methods can be implmented here.

### Module
Module contracts are a way to seperate logic from data. These modules are seperate contracts that can be plugged
into another contract to access its state and methods.

State such as key-value pairs can now be transferred accross contracts.

### Interface
Interfaces are for the Interactor, Proxy and Token contracts to communicate with each other, without the need to store
the logic for each method.

As long as the interface conditions are conformed with, the Interactor, Proxy and Token contracts can be upgraded at will.


## Deploying Base Contracts
The main contracts are BaseInteractor.sol, BaseProxy.sol and BaseToken.sol. These contracts are meant for deployment after
inheriting from other sub-contracts.

## Deploying Modules
Module contracts should be deployed seperately.
