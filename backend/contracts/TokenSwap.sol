// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TokenSwap is ReentrancyGuard {
    IERC20 public tokenVOK;
    IERC20 public tokenKHO;
    uint256 public rate;
    address public owner;

    event TokensSwapped(address indexed user, uint256 amountA, uint256 amountB, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _tokenVOK, address _tokenKHO, uint256 _rate) {
        tokenVOK = IERC20(_tokenVOK);
        tokenKHO = IERC20(_tokenKHO);
        rate = _rate;
        owner = msg.sender;
    }

    function swapAToB(uint256 amountA) external nonReentrant {
        require(amountA > 0, "Amount must be greater than 0");

        uint256 amountB = (amountA * rate) / 100;
        require(tokenKHO.balanceOf(address(this)) >= amountB, "Not enough tokenKHO in reserve");

        require(tokenVOK.transferFrom(msg.sender, address(this), amountA), "Transfer of tokenVOK failed");

        require(tokenKHO.transfer(msg.sender, amountB), "Transfer of tokenKHO failed");

        emit TokensSwapped(msg.sender, amountA, amountB, block.timestamp);
    }

    function swapBToA(uint256 amountB) external nonReentrant {
        require(amountB > 0, "Amount must be greater than 0");

        uint256 amountA = (amountB * 100) / rate;
        require(tokenVOK.balanceOf(address(this)) >= amountA, "Not enough tokenVOK in reserve");

        require(tokenKHO.transferFrom(msg.sender, address(this), amountB), "Transfer of tokenKHO failed");

        require(tokenVOK.transfer(msg.sender, amountA), "Transfer of tokenVOK failed");

        emit TokensSwapped(msg.sender, amountA, amountB, block.timestamp);
    }

    function updateRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Rate must be greater than 0");
        rate = newRate;
    }

    function withdrawtokenVOK(uint256 amount) external onlyOwner {
        tokenVOK.transfer(owner, amount);
    }

    function withdrawtokenKHO(uint256 amount) external onlyOwner {
        tokenKHO.transfer(owner, amount);
    }

    function getReserves() external view returns (uint256 reserveA, uint256 reserveB) {
        reserveA = tokenVOK.balanceOf(address(this));
        reserveB = tokenKHO.balanceOf(address(this));
    }
}
