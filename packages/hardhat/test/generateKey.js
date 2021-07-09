const { use, expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");
const { toBytes } = require("../utils/util");

use(solidity);

let Remit;
let remittance;
let deployer;
let sender;
let remitter;
const nullAddress = "0x0000000000000000000000000000000000000000";
const _nullKey =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

beforeEach("Deploy fresh contract, get signers", async () => {
  Remit = await ethers.getContractFactory("Remittance");
  [deployer, sender, remitter] = await ethers.getSigners();

  remittance = await Remit.deploy();
  await remittance.deployed();
});

describe("Key Generation", () => {
  it("should generate expected hash value from passwords in order", async () => {
    await remittance
      .connect(sender)
      .generateKey(remitter.address, toBytes("abcdef1"))
      .then((remitKey) => {
        assert.isDefined(remitKey, "did not generate expected remit key");
        assert.notEqual(
          remitKey,
          _nullKey,
          "did generate expected null remit key"
        );
      });
  });

  it("should revert if given null address", async () => {
    expect(
      remittance.connect(sender).generateKey(nullAddress, toBytes("abcdef2"))
    ).to.be.revertedWith(
      "Remittance::generateKey:Remitter address cannot be null"
    );
  });

  it("should revert if given empty string as a password", async () => {
    expect(
      remittance.connect(sender).generateKey(remitter.address, toBytes(""))
    ).to.be.revertedWith(
      "Remittance::generateKey:Remitter password can not be empty"
    );
  });
});
