
var help = require('./helpers.js');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

var RenderToken = artifacts.require("RenderToken.sol");
var NewRenderToken = artifacts.require("NewRenderToken.sol");
var RenderTokenCrowdsale = artifacts.require("RenderTokenCrowdsale.sol");

contract('Render Token Migration', function(accounts) {

  it("Should migrate balance after crowdsale", async function() {

    const startBlock = web3.eth.blockNumber+10;
    const endBlock = startBlock+10;
    const USDperETH = 300;
    const maxCapUSD = 134217728;
    const maxTokensICO = 536870912;
    const maxTokensICOFormated = help.formatRNDR(maxTokensICO);
    const maxCapWei = web3.toWei(maxCapUSD/USDperETH, 'ether');
    const rate = maxTokensICOFormated/maxCapWei;
    const wallet = accounts[1];
    const foundationAddress = accounts[2];
    const foundersAddress = accounts[3];
    const finalTotalSupply = 2147483648;
    const initialWalletBalance = parseFloat(await web3.eth.getBalance(wallet));
    var tokensSold = 0;

    console.log('Start block', startBlock);
    console.log('End block', endBlock);
    console.log('USD per ETH', USDperETH);
    console.log('Max Cap USD', maxCapUSD);
    console.log('Max tokens ICO', maxTokensICO);
    console.log('Max Cap Wei', maxCapWei);
    console.log('Max Cap ETH', web3.fromWei(maxCapWei));
    console.log('Tokens per ETH', rate);

    assert.equal(maxTokensICOFormated/rate, maxCapWei);

    let crowdsale = await RenderTokenCrowdsale.new(
      startBlock, endBlock, rate, maxCapWei, wallet, foundationAddress, foundersAddress
    );

    let token = RenderToken.at(await crowdsale.token());

    assert.equal(startBlock, await crowdsale.startBlock());
    assert.equal(endBlock, await crowdsale.endBlock());
    assert.equal(rate, await crowdsale.rate());
    assert.equal(wallet, await crowdsale.wallet());
    assert.equal(foundationAddress, await crowdsale.foundationAddress());
    assert.equal(foundersAddress, await crowdsale.foundersAddress());
    assert.equal(0, await token.totalSupply());

    await help.waitToBlock(startBlock);

    // add whitelisted addresses
    await crowdsale.addWhitelistedAddr(accounts[5], {from: accounts[0]});
    await crowdsale.addWhitelistedAddr(accounts[6], {from: accounts[0]});
    await crowdsale.addWhitelistedAddr(accounts[7], {from: accounts[0]});

    // buying all tokens from 3 accounts

    await crowdsale.sendTransaction({value: web3.toWei(100000), from: accounts[5]});
    tokensSold += parseFloat(web3.toWei(100000)*1200);
    await crowdsale.sendTransaction({value: web3.toWei(200000), from: accounts[6]});
    tokensSold += parseFloat(web3.toWei(200000)*1200);
    await crowdsale.buyTokens(accounts[8], {value: web3.toWei(147392.4266666667), from: accounts[7]});
    tokensSold += parseFloat(web3.toWei(147392.4266666667)*1200);

    assert.equal(maxTokensICO, parseInt(help.parseRNDR(await token.totalSupply())));

    // waiting for end of ICO

    await help.waitToBlock(endBlock);

    // finalize crowdsale and check balances

    crowdsale.finalize();

    let newToken = await NewRenderToken.new(token.contract.address, 25);

    // Calculate old and new totalSupply and balances
    const oldTotalSupply = new BigNumber(await token.totalSupply());
    const newTotalSupply = oldTotalSupply.mul(25).div(100);
    const oldBalances = [
      new BigNumber(await token.balanceOf(accounts[5])),
      new BigNumber(await token.balanceOf(accounts[6])),
      new BigNumber(await token.balanceOf(accounts[8])),
      new BigNumber(await token.balanceOf(foundersAddress)),
      new BigNumber(await token.balanceOf(foundationAddress))
    ];
    const newBalances = [
      oldBalances[0].mul(25).div(100),
      oldBalances[1].mul(25).div(100),
      oldBalances[2].mul(25).div(100),
      oldBalances[3].mul(25).div(100),
      oldBalances[4].mul(25).div(100)
    ];

    // Approve the tokens to the new token contract
    await token.approve(newToken.contract.address, oldBalances[0], {from: accounts[5]});
    await token.approve(newToken.contract.address, oldBalances[1], {from: accounts[6]});
    await token.approve(newToken.contract.address, oldBalances[2], {from: accounts[8]});
    await token.approve(newToken.contract.address, oldBalances[3], {from: foundersAddress});
    await token.approve(newToken.contract.address, oldBalances[4], {from: foundationAddress});

    oldBalances[0].should.be.bignumber
      .equal(await token.allowance(accounts[5], newToken.contract.address));
    oldBalances[1].should.be.bignumber
      .equal(await token.allowance(accounts[6], newToken.contract.address));
    oldBalances[2].should.be.bignumber
      .equal(await token.allowance(accounts[8], newToken.contract.address));
    oldBalances[3].should.be.bignumber
      .equal(await token.allowance(foundersAddress, newToken.contract.address));
    oldBalances[4].should.be.bignumber
      .equal(await token.allowance(foundationAddress, newToken.contract.address));

    // Migrate balances of all holders
    await newToken.migrateBalance({from: accounts[5]});
    await newToken.migrateBalance({from: accounts[6]});
    await newToken.migrateBalance({from: accounts[8]});
    await newToken.migrateBalance({from: foundersAddress});
    await newToken.migrateBalance({from: foundationAddress});

    new BigNumber(0).should.be.bignumber
      .equal(await token.balanceOf(accounts[5]));
    new BigNumber(0).should.be.bignumber
      .equal(await token.balanceOf(accounts[6]));
    new BigNumber(0).should.be.bignumber
      .equal(await token.balanceOf(accounts[8]));
    new BigNumber(0).should.be.bignumber
      .equal(await token.balanceOf(foundersAddress));
    new BigNumber(0).should.be.bignumber
      .equal(await token.balanceOf(foundationAddress));

    // Check balances of the new token
    newBalances[0].should.be.bignumber
      .equal(await newToken.balanceOf(accounts[5]));
    newBalances[1].should.be.bignumber
      .equal(await newToken.balanceOf(accounts[6]));
    newBalances[2].should.be.bignumber
      .equal(await newToken.balanceOf(accounts[8]));
    newBalances[3].should.be.bignumber
      .equal(await newToken.balanceOf(foundersAddress));
    newBalances[4].should.be.bignumber
      .equal(await newToken.balanceOf(foundationAddress));

    // All old tokens are burned, owned by address 0x0
    (await token.balanceOf(0x0)).should.be.bignumber
      .equal(await token.totalSupply());

    // Check the total supply of the new token
    newTotalSupply.should.be.bignumber
      .equal(await newToken.totalSupply());

  });


});
