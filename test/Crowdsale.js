
var help = require('./helpers.js');

var RenderToken = artifacts.require("./RenderToken.sol");
var RenderTokenCrowdsale = artifacts.require("./RenderTokenCrowdsale.sol");

contract('Render Token Crowdsale', function(accounts) {

  it("Should create a crowdsale", async function() {

    const startBlock = web3.eth.blockNumber+10;
    const endBlock = startBlock+100;
    const rate = 10;
    const cap = web3.toWei(1000, 'ether');
    const wallet = accounts[1];
    const foundationAddress = accounts[2];
    const foundersAddress = accounts[3];

    let crowdsale = await RenderTokenCrowdsale.new(
      startBlock, endBlock, rate, cap, wallet, foundationAddress, foundersAddress
    );

    assert.equal(startBlock, await crowdsale.startBlock());
    assert.equal(endBlock, await crowdsale.endBlock());
    assert.equal(rate, await crowdsale.rate());
    assert.equal(wallet, await crowdsale.wallet());
    assert.equal(foundationAddress, await crowdsale.foundationAddress());
    assert.equal(foundersAddress, await crowdsale.foundersAddress());

  });

  it("Should create a crowdsale, reach max cap, finalize it and distribute the tokens correctly", async function() {

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
    var totalSupply = 0;

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

    // buying all tokens from 3 accounts

    await crowdsale.sendTransaction({value: web3.toWei(100000), from: accounts[5]});
    totalSupply += parseFloat(web3.toWei(100000)*1200);
    await crowdsale.sendTransaction({value: web3.toWei(200000), from: accounts[6]});
    totalSupply += parseFloat(web3.toWei(200000)*1200);
    await crowdsale.buyTokens(accounts[8], {value: web3.toWei(147392.4266666667), from: accounts[7]});
    totalSupply += parseFloat(web3.toWei(147392.4266666667)*1200);

    assert.equal(maxTokensICO, parseInt(help.parseRNDR(await token.totalSupply())));

    // waiting for end of ICO

    await help.waitToBlock(endBlock);

    // finalize crowdsale and check balances

    crowdsale.finalize();

    assert.approximately(
      parseFloat(web3.toWei(100000)*1200),
      parseFloat(await token.balanceOf(accounts[5]))
    , help.formatRNDR(1));
    assert.approximately(
      parseFloat(web3.toWei(200000)*1200),
      parseFloat(await token.balanceOf(accounts[6]))
    , help.formatRNDR(1));
    assert.approximately(
      parseFloat(web3.toWei(147392.4266666667)*1200),
      parseFloat(await token.balanceOf(accounts[8]))
    , help.formatRNDR(1));

    assert.equal(
      totalSupply*2.6,
      parseFloat(await token.balanceOf(foundationAddress))
    );
    assert.equal(
      totalSupply*0.4,
      parseFloat(await token.balanceOf(foundersAddress))
    );

    totalSupply += (totalSupply*2.6)+(totalSupply*0.4);

    assert.equal(finalTotalSupply, parseInt(help.parseRNDR(totalSupply)));

    assert.equal(
      finalTotalSupply,
      parseInt(help.parseRNDR(await token.totalSupply()))
    );

  });

  it("Should create a crowdsale, finalize it and distribute the tokens correctly", async function() {

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
    var totalSupply = 0;

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

    // buying all tokens from 2 accounts

    await crowdsale.sendTransaction({value: web3.toWei(100000), from: accounts[5]});
    totalSupply += parseFloat(web3.toWei(100000)*1200);
    await crowdsale.sendTransaction({value: web3.toWei(150000), from: accounts[6]});
    totalSupply += parseFloat(web3.toWei(150000)*1200);

    assert.equal(totalSupply, parseFloat(await token.totalSupply()));

    // waiting for end of ICO

    await help.waitToBlock(endBlock);

    // finalize crowdsale and check foundation and founders balance

    crowdsale.finalize();

    assert.equal(
      totalSupply*2.6,
      parseFloat(await token.balanceOf(foundationAddress))
    );
    assert.equal(
      totalSupply*0.4,
      parseFloat(await token.balanceOf(foundersAddress))
    );

    totalSupply += (totalSupply*2.6)+(totalSupply*0.4);

    assert.equal(
      totalSupply,
      parseFloat(await token.totalSupply())
    );

  });

});
