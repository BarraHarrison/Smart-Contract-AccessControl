import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

describe("SecurityAccessControl – Deployment & Roles", function () {
    let deployer, user1, user2;
    let contract;

    beforeEach(async function () {
        [deployer, user1, user2] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("SecurityAccessControl");
        contract = await Factory.deploy();
        await contract.waitForDeployment();
    });

    it("Should deploy successfully", async function () {
        const address = await contract.getAddress();
        expect(address).to.properAddress;
    });

    it("Deployer should have DEFAULT_ADMIN_ROLE", async function () {
        const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
        expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.equal(true);
    });

    it("Deployer should have PAUSER_ROLE", async function () {
        const PAUSER_ROLE = await contract.PAUSER_ROLE();
        expect(await contract.hasRole(PAUSER_ROLE, deployer.address)).to.equal(true);
    });

    it("Deployer should have BLACKLISTER_ROLE", async function () {
        const BLACKLISTER_ROLE = await contract.BLACKLISTER_ROLE();
        expect(await contract.hasRole(BLACKLISTER_ROLE, deployer.address)).to.equal(true);
    });

    it("Deployer should have FREEZER_ROLE", async function () {
        const FREEZER_ROLE = await contract.FREEZER_ROLE();
        expect(await contract.hasRole(FREEZER_ROLE, deployer.address)).to.equal(true);
    });

    it("Deployer should have FUNDER_ROLE", async function () {
        const FUNDER_ROLE = await contract.FUNDER_ROLE();
        expect(await contract.hasRole(FUNDER_ROLE, deployer.address)).to.equal(true);
    });

    it("Non-admin should NOT be able to grant roles", async function () {
        const PAUSER_ROLE = await contract.PAUSER_ROLE();
        const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();

        await expect(
            contract.connect(user1).grantRole(PAUSER_ROLE, user2.address)
        ).to.be.revertedWithCustomError(
            contract,
            "AccessControlUnauthorizedAccount"
        ).withArgs(user1.address, DEFAULT_ADMIN_ROLE);
    });

    it("Non-admin should NOT be able to revoke roles", async function () {
        const PAUSER_ROLE = await contract.PAUSER_ROLE();
        const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();

        await expect(
            contract.connect(user1).revokeRole(PAUSER_ROLE, deployer.address)
        ).to.be.revertedWithCustomError(
            contract,
            "AccessControlUnauthorizedAccount"
        ).withArgs(user1.address, DEFAULT_ADMIN_ROLE);
    });
});

describe("SecurityAccessControl – Pausing System", function () {
    let deployer, user1;
    let contract;

    beforeEach(async function () {
        [deployer, user1] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("SecurityAccessControl");
        contract = await Factory.deploy();
        await contract.waitForDeployment();
    });

    it("Contract should start unpaused", async function () {
        expect(await contract.paused()).to.equal(false);
    });

    it("PAUSER_ROLE should be able to pause", async function () {
        await expect(contract.pause())
            .to.emit(contract, "Paused")
            .withArgs(deployer.address);

        expect(await contract.paused()).to.equal(true);
    });

    it("PAUSER_ROLE should be able to unpause", async function () {
        await contract.pause();

        await expect(contract.unpause())
            .to.emit(contract, "Unpaused")
            .withArgs(deployer.address);

        expect(await contract.paused()).to.equal(false);
    });

    it("Non-PAUSER_ROLE should NOT be able to pause", async function () {
        const PAUSER_ROLE = await contract.PAUSER_ROLE();
        await expect(
            contract.connect(user1).pause()
        )
            .to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount")
            .withArgs(user1.address, PAUSER_ROLE);
    });

    it("Non-PAUSER_ROLE should NOT be able to unpause", async function () {
        const PAUSER_ROLE = await contract.PAUSER_ROLE();

        await contract.pause();

        await expect(
            contract.connect(user1).unpause()
        )
            .to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount")
            .withArgs(user1.address, PAUSER_ROLE);
    });

    it("Should block sendTip() while paused", async function () {
        await contract.pause();

        await expect(
            contract.sendTip("hello", { value: 1n })
        ).to.be.revertedWithCustomError(contract, "EnforcedPause");
    });


    it("Should block withdraw() while paused", async function () {
        await contract.pause();

        await expect(contract.withdraw()).to.be.revertedWithCustomError(
            contract,
            "EnforcedPause"
        );
    });


    it("Should block receive() while paused (ETH send)", async function () {
        await contract.pause();

        await expect(
            deployer.sendTransaction({
                to: await contract.getAddress(),
                value: 1n,
            })
        ).to.be.revertedWithCustomError(contract, "EnforcedPause");
    });
});

describe("SecurityAccessControl – Blacklist System", function () {
    let deployer, user1, user2;
    let contract;

    beforeEach(async function () {
        [deployer, user1, user2] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("SecurityAccessControl");
        contract = await Factory.deploy();
        await contract.waitForDeployment();
    });

    it("BLACKLISTER_ROLE should be able to blacklist an address", async function () {
        const BLACKLISTER_ROLE = await contract.BLACKLISTER_ROLE();

        await expect(contract.blacklistAddress(user1.address))
            .to.emit(contract, "Blacklisted")
            .withArgs(user1.address);

        expect(await contract.isBlacklisted(user1.address)).to.equal(true);
    });

    it("BLACKLISTER_ROLE should be able to remove an address from blacklist", async function () {
        const BLACKLISTER_ROLE = await contract.BLACKLISTER_ROLE();

        await contract.blacklistAddress(user1.address);

        await expect(contract.unblacklistAddress(user1.address))
            .to.emit(contract, "Unblacklisted")
            .withArgs(user1.address);

        expect(await contract.isBlacklisted(user1.address)).to.equal(false);
    });

    it("Non-BLACKLISTER_ROLE should NOT be able to blacklist", async function () {
        const BLACKLISTER_ROLE = await contract.BLACKLISTER_ROLE();

        await expect(
            contract.connect(user1).blacklistAddress(user2.address)
        )
            .to.be.revertedWithCustomError(
                contract,
                "AccessControlUnauthorizedAccount"
            )
            .withArgs(user1.address, BLACKLISTER_ROLE);
    });

    it("Non-BLACKLISTER_ROLE should NOT be able to unblacklist", async function () {
        const BLACKLISTER_ROLE = await contract.BLACKLISTER_ROLE();

        await contract.blacklistAddress(user2.address);

        await expect(
            contract.connect(user1).unblacklistAddress(user2.address)
        )
            .to.be.revertedWithCustomError(
                contract,
                "AccessControlUnauthorizedAccount"
            )
            .withArgs(user1.address, BLACKLISTER_ROLE);
    });

    it("Blacklisted address should NOT be able to send tips", async function () {
        await contract.blacklistAddress(user1.address);

        await expect(
            contract.connect(user1).sendTip("blocked", { value: 1n })
        ).to.be.revertedWith("SecurityAccessControl: blacklisted");
    });

    it("Blacklisted address should NOT be able to withdraw", async function () {
        await deployer.sendTransaction({
            to: await contract.getAddress(),
            value: ethers.parseEther("1"),
        });

        await contract.blacklistAddress(deployer.address);

        await expect(contract.withdraw())
            .to.be.revertedWith("SecurityAccessControl: blacklisted");
    });

    it("Blacklisted address should NOT be able to send ETH directly (receive/fallback)", async function () {
        await contract.blacklistAddress(user1.address);

        await expect(
            user1.sendTransaction({
                to: await contract.getAddress(),
                value: 1n,
            })
        ).to.be.revertedWith("SecurityAccessControl: blacklisted");
    });
});
