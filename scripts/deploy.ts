import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("=================================================");
  console.log("AidTraceCore Contract Deployment");
  console.log("Deployer address:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("=================================================");

  const AidTraceFactory = await ethers.getContractFactory("AidTraceCore");
  const aidTrace = await AidTraceFactory.deploy();
  await aidTrace.waitForDeployment();

  const address = await aidTrace.getAddress();
  console.log("SUCCESS: AidTraceCore deployed to:", address);
  console.log("Admin:", await aidTrace.admin());
  console.log("BaseScan URL: https://sepolia.basescan.org/address/" + address);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
