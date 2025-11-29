# SecurityAccessControl – Advanced Solidity Contract (AccessControl + Pausing + Blacklist + Freeze)

This project is an advanced security-focused Solidity smart contract built with **Hardhat, Ethers v6, and OpenZeppelin**. It expands on the Ownable Tip Jar project by using **role-based access control (RBAC)** to manage multiple subsystems securely.

---

## 📌 Project Overview

The goal of this contract is to simulate a real Web3 security architecture with:

* Granular multi-role permissions (Admin, Pauser, Blacklister, Freezer, Funder)
* A global emergency pause system
* Blacklist & freeze restrictions
* Reentrancy-safe withdrawals
* Tip storage with event logging
* Full Hardhat + Ethers v6 test suite

All tests **pass successfully (41 passing, 0 failing)**.

---

## 📘 Key Learnings

### 🔑 1. AccessControl Roles

Unlike Ownable, AccessControl supports flexible permissions. Roles used:

* `DEFAULT_ADMIN_ROLE` – manages all roles
* `PAUSER_ROLE` – pause/unpause the contract
* `BLACKLISTER_ROLE` – restrict malicious accounts
* `FREEZER_ROLE` – freeze accounts temporarily
* `FUNDER_ROLE` – withdraws contract balance

### ⏸ 2. Pausable System

`whenNotPaused` blocks sensitive functions. Only users with `PAUSER_ROLE` can trigger pause/unpause.

### 🚫 3. Blacklist & Freeze Enforcement

Custom modifiers:

* `notBlacklisted(account)`
* `notFrozen(account)`

These restrict a user's ability to:

* send tips
* withdraw
* send ETH directly

### 🔒 4. Safe Withdrawals

Withdrawals use `nonReentrant` and `.call{value: ...}()` for safety.

### 🧪 5. Complete Ethers v6 Test Suite

Tests cover:

* Role assignment
* Unauthorized access reverts
* Pausing behavior
* Blacklist system
* Freeze system
* Tip storage (sendTip/receive/fallback)
* Reentrancy protection
* Withdraw logic

---

## ✨ Contract Features

* Send ETH tips with messages
* Direct ETH support (receive/fallback)
* Retrieve all tips
* Fully permissioned role-based admin system
* Pausable contract state
* Blacklist + freeze functionality
* Secure withdrawals
* ReentrancyGuard protection

---

## 📂 Project Structure

```
contracts/
  SecurityAccessControl.sol

scripts/
  deploy.js
  interact.js

test/
  AccessControlSecurity.test.js

hardhat.config.js
```

---

## ▶ How to Run the Project

### 1. Start a local Hardhat blockchain

```
npx hardhat node
```

### 2. Run tests

```
npx hardhat test
```

### 3. Deploy the contract

```
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Interact with the contract

Examples:

```
node scripts/interact.js sendTip "Hello world" 0.1
node scripts/interact.js pause
node scripts/interact.js blacklist <address>
node scripts/interact.js balance
node scripts/interact.js withdraw
```

---

## 🎉 Final Notes

This project represents a major step into enterprise-style Solidity engineering. It demonstrates layered security, permissions architecture, and a full professional workflow from testing → deployment → contract interaction.