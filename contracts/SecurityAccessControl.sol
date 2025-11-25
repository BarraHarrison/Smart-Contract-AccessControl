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


    // Future features to implement:
    // - blacklist mapping
    // - freeze mapping
    // - modifiers: notBlacklisted, notFrozen
    // - tip() function
    // - withdraw() function
    // - events: UserBlacklisted, UserFrozen, TipReceived, Withdraw
    // - receive() and fallback() functions
}

