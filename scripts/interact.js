import hardhat from "hardhat";
const { ethers } = hardhat;

async function loadContract() {
    const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const Factory = await ethers.getContractFactory("SecurityAccessControl");
    return await Factory.attach(address);
}

function divider() {
    console.log("--------------------------------------------------");
}

async function main() {
    const args = process.argv.slice(2);
    const action = args[0];

    if (!action) {
        console.log("❌ No action provided.");
        console.log("Usage:");
        console.log("  node scripts/interact.js <action> [...params]");
        console.log("Examples:");
        console.log("  node scripts/interact.js sendTip \"Hello\" 0.1");
        console.log("  node scripts/interact.js getTips");
        console.log("  node scripts/interact.js pause");
        console.log("  node scripts/interact.js blacklist <address>");
        return;
    }

    const contract = await loadContract();
    const [deployer, user1, user2] = await ethers.getSigners();

    divider();
    console.log(`🎮 ACTION: ${action}`);
    divider();

    if (action === "sendTip") {
        const message = args[1] || "";
        const amount = args[2] || "0.01";

        console.log(`💸 Sending tip: ${amount} ETH, message: "${message}"`);

        const tx = await contract.connect(user1).sendTip(message, {
            value: ethers.parseEther(amount),
        });
        await tx.wait();

        console.log("✅ Tip sent!");
        return;
    }

    if (action === "getTips") {
        const tips = await contract.getAllTips();
        console.log(`📜 Stored Tips (${tips.length}):`);
        console.log(tips);
        return;
    }

    if (action === "withdraw") {
        console.log("💰 Withdrawing contract balance...");

        const tx = await contract.connect(deployer).withdraw();
        await tx.wait();

        console.log("✅ Withdraw successful");
        return;
    }

    if (action === "pause") {
        await contract.connect(deployer).pause();
        console.log("⏸ Contract paused");
        return;
    }

    if (action === "unpause") {
        await contract.connect(deployer).unpause();
        console.log("▶️ Contract unpaused");
        return;
    }

    if (action === "blacklist") {
        const address = args[1];
        if (!address) {
            console.log("❌ Please provide an address");
            return;
        }

        await contract.connect(deployer).blacklist(address);
        console.log(`🚫 Blacklisted: ${address}`);
        return;
    }

    if (action === "unblacklist") {
        const address = args[1];
        if (!address) {
            console.log("❌ Please provide an address");
            return;
        }

        await contract.connect(deployer).removeFromBlacklist(address);
        console.log(`♻️ Removed from blacklist: ${address}`);
        return;
    }

    if (action === "freeze") {
        const address = args[1];
        if (!address) {
            console.log("❌ Provide an address.");
            return;
        }
        await contract.connect(deployer).freeze(address);
        console.log(`❄️  Frozen: ${address}`);
        return;
    }

    if (action === "unfreeze") {
        const address = args[1];
        if (!address) {
            console.log("❌ Provide an address.");
            return;
        }
        await contract.connect(deployer).unfreeze(address);
        console.log(`🔥 Unfrozen: ${address}`);
        return;
    }

    if (action === "isBlacklisted") {
        const address = args[1];
        const status = await contract.isBlacklisted(address);
        console.log(`🔍 Blacklisted (${address}): ${status}`);
        return;
    }

    if (action === "isFrozen") {
        const address = args[1];
        const status = await contract.isFrozen(address);
        console.log(`🔍 Frozen (${address}): ${status}`);
        return;
    }

    if (action === "balance") {
        const bal = await ethers.provider.getBalance(await contract.getAddress());
        console.log(`💰 Contract Balance: ${ethers.formatEther(bal)} ETH`);
        return;
    }

    console.log(`❌ Unknown action: ${action}`);
    console.log("Use one of: sendTip, getTips, withdraw, pause, unpause, blacklist, unblacklist, freeze, unfreeze, isBlacklisted, isFrozen, balance");
}

main().catch((err) => {
    console.error("❌ ERROR:", err);
});
