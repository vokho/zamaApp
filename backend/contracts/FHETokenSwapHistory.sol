// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../contracts/FHEERC20.sol";

import {FHE, euint128, externalEuint128, externalEaddress} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHETokenSwapHistory is SepoliaConfig {
    using FHE for *;

    struct TokenData {
        eaddress token;
        euint128 amount;
    }

    struct SwapData {
        uint256 order;
        address wallet;
        euint128 time;
        TokenData tokenFromData;
        TokenData tokenToData;
    }

    struct ExternalInputEaddress {
        externalEaddress value;
        bytes proof;
    }

    struct ExternalInputEuint128 {
        externalEuint128 value;
        bytes proof;
    }

    struct ExternalTokenData {
        ExternalInputEaddress externalToken;
        ExternalInputEuint128 externalAmount;
    }

    struct ExternalSwapData {
        ExternalInputEuint128 time;
        address wallet;
        ExternalTokenData tokenFromData;
        ExternalTokenData tokenToData;
    }

    SwapData[] _swapDataArray;

    function getSwapDataArray(address wallet) external view returns (SwapData[] memory swapDataArray) {
        uint128 count = 0;
        for (uint i = 0; i < _swapDataArray.length; i++) {
            if (_swapDataArray[i].wallet == (wallet)) {
                count++;
            }
        }

        SwapData[] memory walletSwapDataArray = new SwapData[](count);
        for (uint i = 0; i < _swapDataArray.length; i++) {
            if (_swapDataArray[i].wallet == (wallet)) {
                walletSwapDataArray[i] = _swapDataArray[i];
            }
        }
        return walletSwapDataArray;
    }

    function addSwapData(ExternalSwapData calldata externalSwapData) external {
        SwapData memory swapData;
        swapData.order = _swapDataArray.length + 1;

        swapData.time = FHE.fromExternal(externalSwapData.time.value, externalSwapData.time.proof);
        swapData.wallet = msg.sender;

        TokenData memory tokenFromData;
        tokenFromData.token = FHE.fromExternal(
            externalSwapData.tokenFromData.externalToken.value,
            externalSwapData.tokenFromData.externalToken.proof
        );
        tokenFromData.amount = FHE.fromExternal(
            externalSwapData.tokenFromData.externalAmount.value,
            externalSwapData.tokenFromData.externalAmount.proof
        );

        swapData.tokenFromData = tokenFromData;

        TokenData memory tokenToData;
        tokenToData.token = FHE.fromExternal(
            externalSwapData.tokenToData.externalToken.value,
            externalSwapData.tokenToData.externalToken.proof
        );
        tokenToData.amount = FHE.fromExternal(
            externalSwapData.tokenToData.externalAmount.value,
            externalSwapData.tokenToData.externalAmount.proof
        );

        swapData.tokenToData = tokenToData;

        _swapDataArray.push(swapData);

        FHE.allow(swapData.time, msg.sender);
        FHE.allowThis(swapData.time);

        FHE.allow(swapData.tokenFromData.token, msg.sender);
        FHE.allowThis(swapData.tokenFromData.token);

        FHE.allow(swapData.tokenFromData.amount, msg.sender);
        FHE.allowThis(swapData.tokenFromData.amount);

        FHE.allow(swapData.tokenToData.token, msg.sender);
        FHE.allowThis(swapData.tokenToData.token);

        FHE.allow(swapData.tokenToData.amount, msg.sender);
        FHE.allowThis(swapData.tokenToData.amount);
    }
}
