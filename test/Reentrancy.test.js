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
    try {
      const actualOwner = await contract.owner();
      assert.equal(actualOwner, owner, "Incorrect owner");
      const ownerBalance = await contract.balanceOf(actualOwner);
      assert.equal(
        ownerBalance.toString(),
        depositAmount.toString(),
        "Owner initial balance should be equal to the deposited amount"
      );
    } catch (error) {
      assert.fail(error.message);
    }
  });
  it("Anyone should be able to send ethers to other users.", async () => {
    try {
      const beforeOwnerBalance = await contract.balanceOf(owner);
      const sendToFriend1 = ethers.utils.parseEther("6");

      await contract.donate(friend1, { value: sendToFriend1 });

      const friend1Balance = await contract.balanceOf(friend1);
      assert.equal(friend1Balance.toString(), sendToFriend1.toString());

      const sendToFriend2 = ethers.utils.parseEther("4");
      const friend1signer = await ethers.getSigner(friend1);
      await contract
        .connect(friend1signer)
        .donate(friend2, { value: sendToFriend2 });

      const friend2Balance = await contract.balanceOf(friend2);
      assert.equal(friend2Balance.toString(), sendToFriend2.toString());
    } catch (error) {
      assert.fail(error.message);
    }
  });
  it("Users should not be able to withdraw more than the balance they have", async () => {
    try {
      const sixEthers = ethers.utils.parseEther("6");
      const fiveEthers = ethers.utils.parseEther("5");

      await contract.donate(friend1, { value: sixEthers });
      await contract.donate(friend2, { value: fiveEthers });

      const friend1BeforeBalance = await contract.balanceOf(friend1);
      const friend2BeforeBalance = await contract.balanceOf(friend2);

      // Should allow to withdraw amount less than or equal to available balance
      const friend1Signer = await ethers.provider.getSigner(friend1);
      await contract.connect(friend1Signer).withdraw(fiveEthers);
      const friend1AfterBalance = await contract.balanceOf(friend1);
      assert.equal(
        friend1AfterBalance.toString(),
        (sixEthers - fiveEthers).toString()
      );

      // Should throw error if tried to withdraw more amount than available
      const friend2Signer = await ethers.provider.getSigner(friend2);

      let ex = {};
      try {
        await contract.connect(friend2Signer).withdraw(sixEthers);
      } catch (error) {
        ex = error;
      } finally {
        assert.equal(
          ex.message,
          "VM Exception while processing transaction: reverted with reason string 'Account does not have enough balance'"
        );
      }
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it("Only owner should be able to destroy the contract", async () => {
    let ex = {};
    try {
      const friend1Signer = await ethers.provider.getSigner(friend1);
      await contract.connect(friend1Signer).kill(friend1);
    } catch (error) {
      ex = error;
    } finally {
      assert.equal(
        ex.message,
        "VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
      );
    }
    //fix this test part. Should test that contract is destructed.
    // try {
    //   await contract.kill(owner);
    //   assert.equal(contract, null);
    // } catch (error) {
    // }
  });
});
