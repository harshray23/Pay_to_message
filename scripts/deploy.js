import hre from "hardhat";

async function main() {
  console.log("Deploying PayToMessage contract...");

  const PayToMessage = await hre.ethers.getContractFactory("PayToMessage");
  const payToMessage = await PayToMessage.deploy();

  await payToMessage.waitForDeployment();

  console.log(`PayToMessage deployed to: ${await payToMessage.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
