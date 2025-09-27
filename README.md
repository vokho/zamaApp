# FHEVM Swap

A FHEVM Hardhat-based project for swap FHE tokens and store FHE user data.

# Quick Start

```sh
cd frontend

npm install

npm run dev
```

# Frontend

The frontend of the project is implemented using the React framework.

## The project contains the following screen forms:

- Portfolio
  - FHE Token Balance: displays the user's token balance
  - FHE Token Faucet: allows to obtain additional tokens
- Swap
  - FHE Swap: allows to execute token swaps
  - FHE Swap History: displays user token swap history

# Backend

## The project backend contains the following contracts:

- FHETokenVOK: an ERC20 token with additional FHE functions inherited from the FHEERC20 contract
- FHETokenKHO: an ERC20 token with additional FHE functions inherited from the FHEERC20 contract
- FHETokenSwapHistory: a contract that reading and writing user token swap history data
- FHEERC20: an abstract contract that contains encrypted wallet balances and functions for reading and writing encrypted data
- TokenSwap: a contract for swap tokens and depositing liquidity
