// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenSwap {
    function swap(address wallet, address tokenFrom, address tokenTo, uint256 amountFrom, uint256 amountTo) public {
        require(amountFrom > 0 && amountTo > 0, "Amounts must be positive");
        require(tokenFrom != tokenTo, "Tokens must be different");

        uint256 contractBalance = IERC20(tokenTo).balanceOf(address(this));
        require(contractBalance >= amountTo, "Insufficient tokenTo balance");

        IERC20(tokenFrom).transferFrom(wallet, address(this), amountFrom);
        IERC20(tokenTo).transfer(wallet, amountTo);
    }

    function deposit(address token, uint256 amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }
}
