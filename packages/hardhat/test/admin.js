const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

let Remit;
let remittance;
let deployer;
let sender;
let remitter;

beforeEach("Deploy contract", async () => {
  Remit = await ethers.getContractFactory("Remittance");
  [deployer, sender, remitter, ...accounts] = await ethers.getSigners();

  remittance = await Remit.deploy();
  await remittance.deployed();
});

describe("Admin Test - Deployment", () => {
  it("Should set the right owner", async () => {
    expect(await remittance.owner()).to.equal(deployer.address);
  });
});
