// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/FHEERC20.sol";

contract FHETokenVOK is ERC20, FHEERC20 {
    constructor(uint128 initialSupply) ERC20("FHETokenVOK", "VOK") {
        _mint(msg.sender, initialSupply);
    }

    function faucet(uint128 amount) external {
        require(amount <= 0.2 * 10 ** 18, "Too much");
        _mint(msg.sender, amount);
    }
}
