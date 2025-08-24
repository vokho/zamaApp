// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/FHEERC20.sol";

contract FHETokenKHO is ERC20, FHEERC20 {
    constructor(uint128 initialSupply) ERC20("FHETokenKHO", "KHO") {
        _mint(msg.sender, initialSupply);
    }
}
