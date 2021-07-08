const { expect } = require("chai");
const { ethers } = require("hardhat");
const { assert } = require("chai");

describe("AttackReentracny", function () {
  let attackContract, depositAmount;
  let vulnerableContract;
  let owner;
  beforeEach(async () => {
    [owner, friend1, friend2] = await ethers.provider.listAccounts();
    depositAmount = ethers.utils.parseEther("10");
    const Reentrance = await ethers.getContractFactory("Reentrancy");
    vulnerableContract = await Reentrance.deploy({ value: depositAmount });
    await vulnerableContract.deployed();

    const AttackReentrance = await ethers.getContractFactory(
      "AttackReentrancy"
    );
    attackContract = await AttackReentrance.deploy(vulnerableContract.address);
    await attackContract.deployed();
  });

  it("should be able to attack the vulnerable contract", async () => {
    const contractBalanceBefore = await ethers.provider.getBalance(
      attackContract.address
    );
    expect(contractBalanceBefore).to.equal(0);
    const attackAmount = ethers.utils.parseEther("1");
    await attackContract.attack({ value: attackAmount });
    const contractBalanceAfter = await ethers.provider.getBalance(
      attackContract.address
    );
    //add openzeppelin test helper
  });
});
