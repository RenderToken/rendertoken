pragma solidity ^0.4.18;

import "../flattened/RenderToken.sol";

/**
 * @title RenderTokenMock
 */
contract RenderTokenMock is RenderToken {

  function RenderTokenMock(address initialAccount, uint256 initialBalance) {
    balances[initialAccount] = initialBalance;
    totalSupply = initialBalance;
  }

}
