pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "zeppelin-solidity/contracts/token/ERC827/ERC827Token.sol";

/**
 * @title NewRenderToken
 * @dev ERC20 ownable, mintable and pausable token
 * The token will be minted by the owner and oldToken hoders
 */
contract NewRenderToken is MintableToken, PausableToken, ERC827Token {

  string public constant name = "Render Token";
  string public constant symbol = "RNDR";
  uint8 public constant decimals = 18;

  // The old token address, it should be a StandardToken
  StandardToken public oldToken;

  // The new balance factor of the new token balance to be multiplied after
  // being divided by 100.
  uint8 public newBalanceFactor;

  /**
   * @dev Constructor
   * @param _oldToken see oldToken
   * @param _newBalanceFactor see newBalanceFactor
   */
  function NewRenderToken(address _oldToken, uint8 _newBalanceFactor) {
    require(_oldToken != address(0));
    require(_newBalanceFactor > 0);

    oldToken = StandardToken(_oldToken);
    newBalanceFactor = _newBalanceFactor;
  }

  /**
   * @dev Migrate the balances form the old token
   *
   * The migrateBalance function should be called with the entire balance of the
   * sender in the old token being allowed to this new token.
   * The old tokens are sent to address 0x0 and the new ones are issued.
   */
  function migrateBalance() public {
    require(oldToken.balanceOf(msg.sender) == oldToken.allowance(msg.sender, address(this)));

    uint256 oldBalance = oldToken.balanceOf(msg.sender);
    uint256 newBalance = oldBalance.mul(newBalanceFactor).div(100);
    balances[msg.sender] = newBalance;
    oldToken.transferFrom(msg.sender, address(0), oldBalance);
    totalSupply_ = totalSupply_.add(newBalance);
    Transfer(address(0), msg.sender, newBalance);
  }

}
