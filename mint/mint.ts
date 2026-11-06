import hre from "hardhat";
const { ethers, network } = hre as any;

async function main() {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const tokenUri = process.env.METADATA_URI;

    if (!contractAddress || !tokenUri) {
        throw new Error("Missing CONTRACT_ADDRESS or METADATA_URI in .env");
    }

    const [minter] = await ethers.getSigners();

    console.log(`\nMinting on\t[${network.name}]`);
    console.log(`Contract:\t${contractAddress}`);
    console.log(`Recipient:\t${minter.address}`);
    console.log(`Token URI:\t${tokenUri}\n`);

    const TokenizeArt = await ethers.getContractFactory("TokenizeArt");
    const tokenizeArt = TokenizeArt.attach(contractAddress);

    const transaction = await tokenizeArt.mintNFT(minter.address, tokenUri);
    console.log(`Transaction Hash:\t${transaction.hash}\n`);

    const receipt = await transaction.wait();

    let tokenId = "Unknown";
    for (const log of receipt.logs) {
        try {
            const parsedLog = tokenizeArt.interface.parseLog(log);
            if (parsedLog?.name === "Transfer") {
                tokenId = parsedLog.args[2].toString();
                break;
            }
        } catch (e) {
        }
    }

    const owner = await tokenizeArt.ownerOf(tokenId);
    const uri = await tokenizeArt.tokenURI(tokenId);

    console.log(`Token ID:\t${tokenId}`);
    console.log(`ownerOf:\t${owner}`);
    console.log(`tokenURI:\t${uri}\n`);
}

main().catch((error) => {
    console.error("\nMinting failed:", error);
    process.exitCode = 1;
});
