pragma solidity ^0.4.14;

import './RenderToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol';

/**
 * @title RenderTokenCrowdsale
 * @dev Capped crowdsale for the RenderToken, distributing the tokens
 * and funds once it finalize.
 * Only whitelisted addresses added by the owner of teh contract can
 * buy tokens
 */
contract RenderTokenCrowdsale is CappedCrowdsale, FinalizableCrowdsale {

  address public foundationAddress;
  address public foundersAddress;

  mapping(address => bool) public whitelistedAddrs;

  modifier fromWhitelistedAddr(){
    require(whitelistedAddrs[msg.sender]);
    _;
  }

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

  // override buyTokens function to allow only whitelisted addresses buy
  function buyTokens(address beneficiary) fromWhitelistedAddr() payable {
    super.buyTokens(beneficiary);
  }

  // add a whitelisted address
  function addWhitelistedAddr(address whitelistedAddr) onlyOwner {
    require(!whitelistedAddrs[whitelistedAddr]);
    whitelistedAddrs[whitelistedAddr] = true;
  }

  // remove a whitelisted address
  function removeWhitelistedAddr(address whitelistedAddr) onlyOwner {
    require(whitelistedAddrs[whitelistedAddr]);
    whitelistedAddrs[whitelistedAddr] = false;
  }

  // finalization function called by the finalize function that will distribute
  // the remaining tokens
  function finalization() internal {
    uint256 tokensSold = token.totalSupply();
    uint256 finalTotalSupply = cap.mul(rate).mul(4);

    // send the 10% of the final total supply to the founders
    uint256 foundersTokens = finalTotalSupply.div(10);
    token.mint(foundersAddress, foundersTokens);

    // send the 65% plus the unsold tokens in ICO to the foundation
    uint256 foundationTokens = finalTotalSupply.sub(tokensSold)
      .sub(foundersTokens);
    token.mint(foundationAddress, foundationTokens);

    super.finalization();
  }

  function createTokenContract() internal returns (MintableToken) {
    return new RenderToken();
  }

}
