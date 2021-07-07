const { expect } = require("chai");
const { ethers } = require("hardhat");
const { assert } = require("chai");

describe("Reentracny", function () {
  let contract, depositAmount;
  let owner, friend1, friend2;
  beforeEach(async () => {
    [owner, friend1, friend2] = await ethers.provider.listAccounts();
    depositAmount = ethers.utils.parseEther("10");
    const Reentrance = await ethers.getContractFactory("Reentrancy");
    contract = await Reentrance.deploy({ value: depositAmount });
    await contract.deployed();
  });
  it("Should have the correct owner, and owner balance", async () => {
    const actualOwner = await contract.owner();
    assert.equal(actualOwner, owner, "Incorrect owner");
    const ownerBalance = await contract.balanceOf(actualOwner);
    assert.equal(
      ownerBalance.toString(),
      depositAmount.toString(),
      "Owner initial balance should be equal to the deposited amount"
    );
  });
  it("Anyone should be able to send ethers to other users.", async () => {
    const beforeOwnerBalance = await contract.balanceOf(owner);
    const sendToFriend1 = ethers.utils.parseEther("6");

    await contract.donate(friend1, { from: owner, value: sendToFriend1 });

    const friend1Balance = await contract.balanceOf(friend1);
    assert.equal(friend1Balance.toString(), sendToFriend1.toString());

    const sendToFriend2 = ethers.utils.parseEther("4");
    let friend1signer = await ethers.getSigner(1);
    console.log(friend1signer.address, owner);
    contract.connect(friend1signer);
    // console.log(await contract.owner(), friend1);
    await contract.donate(friend2, { value: sendToFriend2 });

    const friend2Balance = await contract.balanceOf(friend2);
    assert.equal(friend2Balance.toString(), sendToFriend2.toString());
  });
});
