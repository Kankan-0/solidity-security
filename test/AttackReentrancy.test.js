const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
describe("AttackReentrancy", function () {
  before(async function () {
    this.VulnerableReentrancy = await ethers.getContractFactory("Reentrancy");
    this.FixedReentrancy = await ethers.getContractFactory("FixedReentrancy");
    this.AttackReentrancy = await ethers.getContractFactory("AttackReentrancy");
  });
  beforeEach(async function () {
    [owner, friend1, friend2] = await ethers.provider.listAccounts();
    (this.owner = owner), (this.friend1 = friend1), (this.friend2 = friend2);
    this.depositAmount = ethers.utils.parseEther("10");
    this.vulnerableContract = await this.VulnerableReentrancy.deploy({
      value: this.depositAmount,
    });
    await this.vulnerableContract.deployed();

    this.fixedContract = await this.FixedReentrancy.deploy({
      value: this.depositAmount,
    });
    await this.fixedContract.deployed();

    this.attackVulnerableContract = await this.AttackReentrancy.deploy(
      this.vulnerableContract.address
    );
    await this.attackVulnerableContract.deployed();

    this.attackFixedContract = await this.AttackReentrancy.deploy(
      this.fixedContract.address
    );
    await this.attackFixedContract.deployed();
  });

  it("should be able to attack the vulnerable contract", async function () {
    const contractBalanceBefore = await ethers.provider.getBalance(
      this.attackVulnerableContract.address
    );
    expect(contractBalanceBefore).to.be.equal("0");
    const attackAmount = ethers.utils.parseEther("1");
    await this.attackVulnerableContract.attack({ value: attackAmount });
    const contractBalanceAfter = await ethers.provider.getBalance(
      this.attackVulnerableContract.address
    );
    expect(Number(contractBalanceAfter)).to.be.greaterThan(
      Number(attackAmount)
    );
  });
  it("should fail to attack the fixed contract", async function () {
    const contractBalanceBefore = await ethers.provider.getBalance(
      this.attackFixedContract.address
    );
    expect(contractBalanceBefore).to.be.equal("0");
    const attackAmount = ethers.utils.parseEther("1");

    // if only check-effect-interaction pattern is used
    // let expectedError = "Transaction failed.";

    // if only transfer is used
    // let expectedError = "contract call run out of gas and made the transaction revert";

    // if mutex is used
    let expectedError = "One transaction is already in process";

    await expect(
      this.attackFixedContract.attack({ value: attackAmount })
    ).to.be.revertedWith(expectedError);
  });
});
