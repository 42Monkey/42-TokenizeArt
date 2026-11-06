import hre from "hardhat";
const { network } = hre as any;

async function main() {
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!contractAddress) {
        throw new Error("Missing CONTRACT_ADDRESS in .env");
    }

    console.log(`\nVerifying on\t[${network.name}]`);
    console.log(`Contract:\t${contractAddress}\n`);

    try {
        await hre.run("verify:verify", {
            address: contractAddress,
        });
        console.log(`\nVerification complete!`);
    } catch (error: any) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log(`\nContract is already verified!`);
        } else {
            throw error;
        }
    }
}

main().catch((error) => {
    console.error("\nVerification failed:", error);
    process.exitCode = 1;
});
