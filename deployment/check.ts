import hre from "hardhat";
const { ethers, network } = hre as any;

const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

async function main() {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("Missing CONTRACT_ADDRESS in .env");
    }

    const tokenId = Number(process.env.TOKEN_ID ?? 1);

    console.log(`\nChecking on [${network.name}]`);
    console.log(`Contract:\t\t${contractAddress}\n`);

    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
        throw new Error(`No contract found at ${contractAddress} on ${network.name}`);
    }

    const TokenizeArt = await ethers.getContractFactory("TokenizeArt");
    const tokenizeArt = TokenizeArt.attach(contractAddress);

    // smart contract
    const name = await tokenizeArt.name();
    const symbol = await tokenizeArt.symbol();
    const contractOwner = await tokenizeArt.owner();
    const supportsInterface = await tokenizeArt.supportsInterface("0x80ac58cd"); // ERC-721

    // token
    const ownerOfToken = await tokenizeArt.ownerOf(tokenId);
    const balance = await tokenizeArt.balanceOf(ownerOfToken);
    const tokenUri = await tokenizeArt.tokenURI(tokenId);
    const approvedOperator = await tokenizeArt.getApproved(tokenId);
    const isApprovedForAll = await tokenizeArt.isApprovedForAll(ownerOfToken, contractOwner);

    // on-chain output
    console.log(`name():\t\t\t${name}`);
    console.log(`symbol():\t\t${symbol}`);
    console.log(`owner():\t\t${contractOwner}`);
    console.log(`ownerOf(${tokenId}):\t\t${ownerOfToken}`);
    console.log(`balanceOf(holder):\t${balance.toString()}`);
    console.log(`tokenURI(${tokenId}):\t\t${tokenUri}`);
    console.log(`getApproved(${tokenId}):\t\t${approvedOperator}`);
    console.log(`isApprovedForAll():\t${isApprovedForAll}`);
    console.log(`supportsInterface(721):\t${supportsInterface}\n`);

    // off-chain metadata
    const gatewayUrl = tokenUri.replace("ipfs://", IPFS_GATEWAY);
    console.log(`Fetching IPFS JSON from: ${gatewayUrl}\n`);

    try {
        const response = await fetch(gatewayUrl);
        if (response.ok) {
            const metadata = await response.json();
            console.log("Metadata JSON:");
            console.log(JSON.stringify(metadata, null, 2));

            if (metadata.image) {
                console.log(`\nDirect Image Link: ${metadata.image.replace("ipfs://", IPFS_GATEWAY)}\n`);
            }
        } else {
            console.error(`Failed to fetch IPFS payload. HTTP Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Failed to fetch metadata from IPFS:", error);
    }
}

main().catch((error) => {
    console.error("\nCheck failed:", error);
    process.exitCode = 1;
});
