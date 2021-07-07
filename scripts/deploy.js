const hre = require("hardhat");

async function main() {
  const Reentrance = await hre.ethers.getContractFactory("Reentrancy");
  const reentrance = await Reentrance.deploy({
    value: hre.ethers.utils.parseEther("1"),
  });
  await reentrance.deployed();
  console.log("Reentrance deployed to:", reentrance.address);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
