const { use, expect, assert } = require("chai");
const { BigNumber } = require("ethers");
const { solidity } = require("ethereum-waffle");
const { toBytes, evm_increaseTime } = require("../utils/util");

use(solidity);

let Remit;
let remittance;
let deployer;
let sender;
let remitter;
let _remitKey_;
const _nullKey =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const _withdrawalDeadline = 86400;
const receiverPassword = "abcdef";
const gas = 4000000;
const _sent = 20;

beforeEach(
  "deploy a fresh contract, generate secrets and deposit money",
  async () => {
    Remit = await ethers.getContractFactory("Remittance");
    [
      deployer,
      sender,
      remitter,
      randomAddress,
      ...accounts
    ] = await ethers.getSigners();
    remittance = await Remit.deploy();
    await remittance.deployed();

    // Generate secret
    _remitKey_ = await remittance
      .connect(sender)
      .generateKey(remitter.address, toBytes(receiverPassword));
    assert.isDefined(_remitKey_, "did not generate remitter key");

    // Deposit
    const depositTxObj = await remittance
      .connect(sender)
      .deposit(_remitKey_, _withdrawalDeadline, {
        value: _sent,
        gasPrice: gas,
      });
    await depositTxObj.wait();

    assert.isDefined(depositTxObj, "beforeEach:: Deposit has not been mined");
  }
);

describe("Refund happy path tests", () => {
  it("emit Refund event with correct arguments", async () => {
    evm_increaseTime(_withdrawalDeadline + 1);

    await expect(remittance.connect(sender).refund(_remitKey_, { value: 0 }))
      .to.emit(remittance, "LogRefund")
      .withArgs(sender.address, _remitKey_, _sent);
  });

  it("should allow successful refund", async () => {
    // Arrrange
    evm_increaseTime(_withdrawalDeadline + 1);
    const beforeBalance = BigNumber.from(await sender.getBalance());
    const owed = BigNumber.from(_sent);

    // Act
    const refundTxObj = await remittance
      .connect(sender)
      .refund(_remitKey_, { value: 0 });
    const refundTxRecepit = await refundTxObj.wait();
    assert.isDefined(refundTxRecepit, "first refund failed");

    // Calculate gas spent
    const _gasAmount = refundTxRecepit.gasUsed;
    const _gasPrice = refundTxObj.gasPrice;
    const gasCost = _gasPrice.mul(_gasAmount);

    // Assert
    const balanceAfter = BigNumber.from(await sender.getBalance());
    const expectedAfter = beforeBalance.add(owed).sub(gasCost);

    expect(balanceAfter).to.be.equal(expectedAfter);
  });
});

describe("Refund revert tests", () => {
  it("should revert when deadline has not yet passed", async () => {
    await expect(
      remittance.connect(sender).refund(_remitKey_, { value: 0 })
    ).to.be.revertedWith(
      "Remittance::refund:Deposit is not yet eligible for refund"
    );
  });

  it("should revert given null remit Key", async () => {
    evm_increaseTime(_withdrawalDeadline + 1);

    await expect(
      remittance.connect(sender).refund(_nullKey, { value: 0 })
    ).to.be.revertedWith("Remittance::refund:Caller is not depositor");
  });

  it("revert if calling address is not owed a refund", async () => {
    evm_increaseTime(_withdrawalDeadline + 1);

    await expect(
      remittance.connect(randomAddress).refund(_remitKey_, { value: 0 })
    ).to.be.revertedWith("Remittance::refund:Caller is not depositor");
  });

  it("should NOT allow successful double refunds", async () => {
    evm_increaseTime(_withdrawalDeadline + 1);

    const refundTxObj = await remittance
      .connect(sender)
      .refund(_remitKey_, { value: 0 });
    const refundTxRecepit = await refundTxObj.wait();
    assert.isDefined(refundTxRecepit, "first refund failed");

    await expect(
      remittance.connect(sender).refund(_remitKey_, { value: 0 })
    ).to.be.revertedWith("Remittance::refund:Caller is not owed a refund");
  });
});
