const { use, expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("ethers");
const { toBytes, evm_increaseTime } = require("../utils/util");

use(solidity);

let Remit;
let remittance;
let deployer;
let sender;
let remitter;
let _remitKey_;
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

describe("Withdraw happy path tests", () => {
  it("should emit an event with correct arguments", async () => {
    const withdrawTxObj = await remittance
      .connect(remitter)
      .withdraw(toBytes(receiverPassword), { value: 0 });

    await withdrawTxObj.wait();

    await expect(withdrawTxObj)
      .to.emit(remittance, "LogWithdrawal")
      .withArgs(remitter.address, _remitKey_, _sent, toBytes(receiverPassword));
  });

  it("should pay owed money when receiver password is correct", async () => {
    // Arrange
    const beforeBalance = BigNumber.from(await remitter.getBalance());
    const owed = BigNumber.from(_sent);

    // Act
    const withdrawTxObj = await remittance
      .connect(remitter)
      .withdraw(toBytes(receiverPassword), { value: 0 });

    const withdrawTxRecepit = await withdrawTxObj.wait();
    assert.isDefined(
      withdrawTxRecepit,
      "withdraw Tx did not get mined/execute"
    );

    // Calculate gas spent
    const _gasAmount = withdrawTxRecepit.gasUsed;
    const _gasPrice = withdrawTxObj.gasPrice;
    const gasCost = _gasPrice.mul(_gasAmount);

    // Assert
    const balanceAfter = BigNumber.from(await remitter.getBalance());
    const expectedAfter = beforeBalance.add(owed).sub(gasCost);

    expect(balanceAfter).to.be.equal(expectedAfter);
  });

  it("should clear ledger after successful withdrawal", async () => {
    // Arrange
    const remitBefore = await remittance.ledger(_remitKey_);

    // Act
    const withdrawTxObj = await remittance
      .connect(remitter)
      .withdraw(toBytes(receiverPassword), { value: 0 });

    const withdrawTxRecepit = await withdrawTxObj.wait();
    assert.isDefined(
      withdrawTxRecepit,
      "withdraw Tx did not get mined/execute"
    );

    // Assert
    const remitAfter = await remittance.ledger(_remitKey_);
    const zero = BigNumber.from(0);

    assert.notEqual(
      remitBefore.amount,
      remitAfter.amount,
      "ledger amount not cleared after withdrawl"
    );
    expect(remitAfter.amount).to.equal(zero);
    expect(remitAfter.deadline).to.equal(zero);
  });
});

describe("withdraw revert tests", () => {
  it("should NOT allow double successful withdrawals", async () => {
    const firstWithdrawTxObj = await remittance
      .connect(remitter)
      .withdraw(toBytes(receiverPassword), { value: 0 });
    await firstWithdrawTxObj.wait();
    assert.isDefined(firstWithdrawTxObj, "first withdrawal did not get mined");

    await expect(
      remittance
        .connect(remitter)
        .withdraw(toBytes(receiverPassword), { value: 0 })
    ).to.be.revertedWith(
      "Remittance::withdraw:Caller is not owed a withdrawal"
    );
  });

  it("should revert when given empty password", async () => {
    await expect(
      remittance.connect(remitter).withdraw(toBytes(""), { value: 0 })
    ).to.be.revertedWith("");
  });

  it("should revert when withdrawal deadline has passed", async () => {
    evm_increaseTime(_withdrawalDeadline + 1);

    await expect(
      remittance
        .connect(remitter)
        .withdraw(toBytes(receiverPassword), { value: 0 })
    ).to.be.revertedWith("");
  });

  it("should revert if the withdrawer address is not owed", async () => {
    await expect(
      remittance
        .connect(randomAddress)
        .withdraw(toBytes(receiverPassword), { value: 0 })
    ).to.be.revertedWith("");
  });

  it("should revert if receiver password is incorrect", async () => {
    await expect(
      remittance
        .connect(remitter)
        .withdraw(toBytes("wrongPassword"), { value: 0 })
    ).to.be.revertedWith(
      "Remittance::withdraw:Caller is not owed a withdrawal"
    );
  });
});
