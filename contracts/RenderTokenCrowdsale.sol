pragma solidity ^0.4.14;

import './RenderToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol';

/**
 * @title RenderTokenCrowdsale
 * @dev Capped crowdsale for the RenderToken, distributing the tokens
 * and funds once it finalize
 */
contract RenderTokenCrowdsale is CappedCrowdsale, FinalizableCrowdsale {

  address public foundationAddress;
  address public foundersAddress;

  function RenderTokenCrowdsale(
    uint256 startBlock, uint256 endBlock,
    uint256 rate, uint256 cap, address wallet,
    address _foundationAddress, address _foundersAddress
  ) CappedCrowdsale(cap)
    FinalizableCrowdsale()
    Crowdsale(startBlock, endBlock, rate, wallet)
  {
    require(_foundationAddress != address(0));
    require(_foundersAddress != address(0));

    foundationAddress = _foundationAddress;
    foundersAddress = _foundersAddress;
  }

  // finalization function called by the finalize function that will distribute
  // the remaining tokens
  function finalization() internal {
    uint256 tokensSold = token.totalSupply();

    uint256 foundationTokens = tokensSold.mul(26000).div(10000);
    uint256 foundersTokens = tokensSold.mul(4000).div(10000);

    token.mint(foundationAddress, foundationTokens);
    token.mint(foundersAddress, foundersTokens);

    super.finalization();
  }

  function createTokenContract() internal returns (MintableToken) {
    return new RenderToken();
  }

}
