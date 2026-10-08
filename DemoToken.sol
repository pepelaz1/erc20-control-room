// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";

/// @notice Demonstration token. Admin transfer delay is zero on this local sample.
contract DemoToken is ERC20Capped, ERC20Burnable, AccessControlDefaultAdminRules {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    constructor(string memory name_, string memory symbol_)
        ERC20(name_, symbol_) ERC20Capped(1_000_000 ether)
        AccessControlDefaultAdminRules(0, msg.sender) {
        _grantRole(MINTER_ROLE, msg.sender);
        _mint(msg.sender, 10_000 ether);
    }
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) { _mint(to, amount); }
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}
