const { ethers } = require("hardhat");
const vulnerableContract = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
  const AttackContract = await ethers.getContractFactory("AttackReentrancy");
  const attackContract = await AttackContract.deploy(vulnerableContract);
  await attackContract.deployed();

  console.log("Attack Contract deployed to:", attackContract.address);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
