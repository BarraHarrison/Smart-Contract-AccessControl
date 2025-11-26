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
