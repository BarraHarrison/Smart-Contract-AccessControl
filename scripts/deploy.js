import { ethers } from "hardhat";

async function main() {
    console.log("==============================================");
    console.log("🚀 Deploying SecurityAccessControl Contract...");
    console.log("==============================================");

    const [deployer] = await ethers.getSigners();

    console.log(`📌 Deployer Address: ${deployer.address}`);
    console.log("----------------------------------------------");

    const Factory = await ethers.getContractFactory("SecurityAccessControl");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log(`✅ Contract Deployed At: ${contractAddress}`);
    console.log("----------------------------------------------");

    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const PAUSER_ROLE = await contract.PAUSER_ROLE();
    const BLACKLISTER_ROLE = await contract.BLACKLISTER_ROLE();
    const FREEZER_ROLE = await contract.FREEZER_ROLE();
    const FUNDER_ROLE = await contract.FUNDER_ROLE();

    console.log("🔍 Verifying Initial Role Assignments...");

    const roles = [
        { name: "DEFAULT_ADMIN_ROLE", hash: DEFAULT_ADMIN_ROLE },
        { name: "PAUSER_ROLE", hash: PAUSER_ROLE },
        { name: "BLACKLISTER_ROLE", hash: BLACKLISTER_ROLE },
        { name: "FREEZER_ROLE", hash: FREEZER_ROLE },
        { name: "FUNDER_ROLE", hash: FUNDER_ROLE },
    ];

    for (const r of roles) {
        const hasRole = await contract.hasRole(r.hash, deployer.address);
        console.log(`   • ${r.name}: ${hasRole ? "✔️  Assigned" : "❌ Missing"}`);
    }

    console.log("----------------------------------------------");
    console.log("🎉 Deployment Successful!");
    console.log("📦 Contract Ready for Interaction");
    console.log("==============================================");
}

main().catch((error) => {
    console.error("❌ Deployment Error:", error);
    process.exitCode = 1;
});
