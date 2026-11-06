import hre from "hardhat";
const { ethers, network } = hre as any;

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log(`\nDeploying to\t[${network.name}]`);
    console.log(`Deployer:\t\t${deployer.address}`);

    const TokenizeArt = await ethers.getContractFactory("TokenizeArt");
    const tokenizeArt = await TokenizeArt.deploy();
    await tokenizeArt.waitForDeployment();

    const address = await tokenizeArt.getAddress();
    const transactionHash = tokenizeArt.deploymentTransaction()?.hash;

    console.log(`\nContract:\t\t${address}`);
    console.log(`Transaction Hash:\t${transactionHash}`);

    if (network.name === "sepolia") {
        console.log(`Explorer: https://sepolia.etherscan.io/address/${address}`);
    }

    console.log(`\nSet CONTRACT_ADDRESS="${address}" in .env\n`);
}

main().catch((error) => {
    console.error("\nDeployment failed:", error);
    process.exitCode = 1;
});
