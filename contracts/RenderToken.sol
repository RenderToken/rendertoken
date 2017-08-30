pragma solidity ^0.4.14;

import "zeppelin-solidity/contracts/token/MintableToken.sol";

/**
 * @title RenderToken
 * @dev ERC20 mintable token
 * The token will be minted by the crowdsale contract only
 */
contract RenderToken is MintableToken {

  string public constant name = "Render Token";
  string public constant symbol = "RNDR";
  uint8 public constant decimals = 18;

}
