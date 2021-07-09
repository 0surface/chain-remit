function toBytes(input) {
  return ethers.utils.formatBytes32String(input);
}

async function evm_increaseTime(time) {
  await network.provider.send("evm_increaseTime", [time]);
  await network.provider.send("evm_mine");
}

async function evm_setNextBlockTimestamp(blockTimestamp) {
  await network.provider.send("evm_setNextBlockTimestamp", [blockTimestamp]);
  await network.provider.send("evm_mine");
}

module.exports = {
  toBytes,
  evm_increaseTime,
  evm_setNextBlockTimestamp,
};
