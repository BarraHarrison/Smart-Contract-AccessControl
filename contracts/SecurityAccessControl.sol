// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// --- OpenZeppelin Imports ---
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SecurityAccessControl
 * @notice Base skeleton for an advanced AccessControl contract.
 * @dev Minimal, clean, compilable structure before adding real logic.
 */
contract SecurityAccessControl is AccessControl, Pausable, ReentrancyGuard {

    // -------------------------
    //   Role Declarations
    // -------------------------
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BLACKLISTER_ROLE = keccak256("BLACKLISTER_ROLE");
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");
    bytes32 public constant FUNDER_ROLE = keccak256("FUNDER_ROLE");

    // -------------------------
    //   State
    // -------------------------

    // Blacklist + freeze state
    mapping(address => bool) private _blacklisted;
    mapping(address => bool) private _frozen;

    // Tip storage
    struct Tip {
        address from;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    Tip[] private _tips;

    // -------------------------
    //   Events
    // -------------------------

    event UserBlacklisted(address indexed account);
    event UserRemovedFromBlacklist(address indexed account);
    event UserFrozen(address indexed account);
    event UserUnfrozen(address indexed account);

    event TipReceived(address indexed from, uint256 amount, string message);
    event Withdraw(address indexed to, uint256 amount);

    // -------------------------
    //   Modifiers
    // -------------------------

    modifier notBlacklisted(address account) {
        require(!_blacklisted[account], "SecurityAccessControl: blacklisted");
        _;
    }

    modifier notFrozen(address account) {
        require(!_frozen[account], "SecurityAccessControl: frozen");
        _;
    }



    // -------------------------
    //   Constructor
    // -------------------------
    constructor() {
        // Grant DEFAULT_ADMIN_ROLE to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        // Admin can initially manage all subsystem roles
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(BLACKLISTER_ROLE, msg.sender);
        _grantRole(FREEZER_ROLE, msg.sender);
        _grantRole(FUNDER_ROLE, msg.sender);
    }

    // -------------------------
    //   Placeholder Functions
    // -------------------------

    /**
     * @notice Placeholder for pause function — implementation coming next.
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Placeholder for unpause function — implementation coming next.
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // -------------------------
    //   Blacklisting Logic
    // -------------------------

    function blacklist(address account) external onlyRole(BLACKLISTER_ROLE) {
        if (!_blacklisted[account]) {
            _blacklisted[account] = true;
            emit UserBlacklisted(account);
        }
    }

    function removeFromBlacklist(address account) external onlyRole(BLACKLISTER_ROLE) {
        if (_blacklisted[account]) {
            _blacklisted[account] = false;
            emit UserRemovedFromBlacklist(account);
        }
    }

    function isBlacklisted(address account) external view returns (bool) {
        return _blacklisted[account];
    }

    // -------------------------
    //   Freeze Logic
    // -------------------------

    function freeze(address account) external onlyRole(FREEZER_ROLE) {
        if (!_frozen[account]) {
            _frozen[account] = true;
            emit UserFrozen(account);
        }
    }

    function unfreeze(address account) external onlyRole(FREEZER_ROLE) {
        if (_frozen[account]) {
            _frozen[account] = false;
            emit UserUnfrozen(account);
        }
    }

    function isFrozen(address account) external view returns (bool) {
        return _frozen[account];
    }

    // -------------------------
    //   Tips Logic
    // -------------------------

    /**
     * @notice Send an ETH tip with an optional message.
     */
    function sendTip(string calldata message)
        external
        payable
        whenNotPaused
        notBlacklisted(msg.sender)
        notFrozen(msg.sender)
    {
        require(msg.value > 0, "SecurityAccessControl: no ETH sent");

        _tips.push(
            Tip({
                from: msg.sender,
                amount: msg.value,
                message: message,
                timestamp: block.timestamp
            })
        );

        emit TipReceived(msg.sender, msg.value, message);
    }

    /**
     * @notice Return all tips stored in the contract.
     * @dev For demo / small usage only. Avoid on very large arrays in prod.
     */
    function getAllTips() external view returns (Tip[] memory) {
        return _tips;
    }


    // -------------------------
    //   Withdraw Logic
    // -------------------------

    /**
     * @notice Withdraw the full contract balance to the caller.
     * @dev Restricted to FUNDER_ROLE, protected against reentrancy.
     */
    function withdraw()
        external
        nonReentrant
        whenNotPaused
        onlyRole(FUNDER_ROLE)
        notBlacklisted(msg.sender)
        notFrozen(msg.sender)
    {
        uint256 balance = address(this).balance;
        require(balance > 0, "SecurityAccessControl: no funds to withdraw");

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "SecurityAccessControl: withdraw failed");

        emit Withdraw(msg.sender, balance);
    }




    // Future features to implement:
    // - withdraw() function
    // - events: UserBlacklisted, UserFrozen, TipReceived, Withdraw
    // - receive() and fallback() functions
}

