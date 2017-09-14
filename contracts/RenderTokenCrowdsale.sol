pragma solidity ^0.4.14;

import './RenderToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/RefundableCrowdsale.sol';

/**
 * @title RenderTokenCrowdsale
 * @dev Capped crowdsale for the RenderToken, distributing the tokens
 * and funds once it finalize or return the ethers if minimun cap wasnt
 * reached
 * Only whitelisted addresses added by the owner of teh contract can
 * buy tokens
 */
contract RenderTokenCrowdsale is CappedCrowdsale, RefundableCrowdsale {

  address public foundationAddress;
  address public foundersAddress;

  mapping(address => bool) public whitelistedAddrs;

  modifier fromWhitelistedAddr(){
    require(whitelistedAddrs[msg.sender]);
    _;
  }

  function RenderTokenCrowdsale(
    uint256 startBlock, uint256 endBlock, uint256 rate,
    uint256 minCap, uint256 maxCap, address wallet,
    address _foundationAddress, address _foundersAddress
  ) CappedCrowdsale(maxCap)
    RefundableCrowdsale(minCap)
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
