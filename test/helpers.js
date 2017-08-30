var advanceToBlock = require('./helpers/advanceToBlock');

const TOKEN_DECIMALS = 18;

module.exports = {

  parseRNDR: function(balance){
    return (balance/Math.pow(10,TOKEN_DECIMALS)).toPrecision(TOKEN_DECIMALS);
  },
  formatRNDR: function(balance){
    return (balance*Math.pow(10,TOKEN_DECIMALS));
  },

  waitBlocks: function(toWait){
    return this.waitToBlock(parseInt(web3.eth.blockNumber) + toWait);
  },

  waitToBlock: async function(blockNumber){
    let blocksLeft = blockNumber - web3.eth.blockNumber;

    if ((blocksLeft % 5) != 0 && blocksLeft > 0)
      console.log('Waiting ', blocksLeft, ' blocks..');

    if (blockNumber > web3.eth.blockNumber)
      await advanceToBlock.advanceToBlock(blockNumber);
    else
      return false; // no need to wait
  }
}
