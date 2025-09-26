// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/FHEERC20.sol";

contract FHETokenKHO is ERC20, FHEERC20 {
    constructor(uint128 initialSupply) ERC20("FHETokenKHO", "KHO") {
        _mint(address(this), initialSupply);
    }

    function faucet(uint128 amount) external {
        require(amount <= 0.2 * 10 ** 18, "Too much");
        _mint(msg.sender, amount);
    }
}
