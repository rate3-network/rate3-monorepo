pragma solidity ^0.4.24;

import "./tokens/CompliantToken.sol";
import "./tokens/ProxySupportedERC20Token.sol";

contract BaseToken is CompliantToken, ProxySupportedERC20Token {}