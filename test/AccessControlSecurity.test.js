import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;


describe("SecurityAccessControl – Deployment & Roles", function () {
    let deployer, user1, user2;
    let contract;

    const PAUSER_ROLE =
        "0x" + Buffer.from("PAUSER_ROLE").toString("hex").padEnd(64, "0");
    const BLACKLISTER_ROLE =
        "0x" + Buffer.from("BLACKLISTER_ROLE").toString("hex").padEnd(64, "0");
    const FREEZER_ROLE =
        "0x" + Buffer.from("FREEZER_ROLE").toString("hex").padEnd(64, "0");
    const FUNDER_ROLE =
        "0x" + Buffer.from("FUNDER_ROLE").toString("hex").padEnd(64, "0");

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
        const DEFAULT_ADMIN_ROLE =
            await contract.DEFAULT_ADMIN_ROLE(); // read from contract
        const hasRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
        expect(hasRole).to.equal(true);
    });

    it("Deployer should have PAUSER_ROLE", async function () {
        const hasRole = await contract.hasRole(PAUSER_ROLE, deployer.address);
        expect(hasRole).to.equal(true);
    });

    it("Deployer should have BLACKLISTER_ROLE", async function () {
        const hasRole = await contract.hasRole(BLACKLISTER_ROLE, deployer.address);
        expect(hasRole).to.equal(true);
    });

    it("Deployer should have FREEZER_ROLE", async function () {
        const hasRole = await contract.hasRole(FREEZER_ROLE, deployer.address);
        expect(hasRole).to.equal(true);
    });

    it("Deployer should have FUNDER_ROLE", async function () {
        const hasRole = await contract.hasRole(FUNDER_ROLE, deployer.address);
        expect(hasRole).to.equal(true);
    });

    it("Non-admin should NOT be able to grant roles", async function () {
        const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();

        await expect(
            contract.connect(user1).grantRole(PAUSER_ROLE, user2.address)
        ).to.be.revertedWith(
            `AccessControl: account ${user1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
        );
    });

    it("Non-admin should NOT be able to revoke roles", async function () {
        const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();

        await expect(
            contract.connect(user1).revokeRole(PAUSER_ROLE, deployer.address)
        ).to.be.revertedWith(
            `AccessControl: account ${user1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
        );
    });
});
