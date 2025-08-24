// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {FHE, eaddress, euint128, externalEuint128} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

abstract contract FHEERC20 is SepoliaConfig {
    using FHE for *;

    mapping(eaddress encryptedWallet => euint128 encryptedBalance) _encryptedBalance;

    function getEncryptedBalance(eaddress encryptedWallet) external view returns (euint128) {
        return _encryptedBalance[encryptedWallet];
    }

    function setEncryptedBalance(
        eaddress encryptedWallet,
        externalEuint128 externalEncryptedBalance,
        bytes calldata inputProof
    ) external {
        euint128 encryptedBalance = FHE.fromExternal(externalEncryptedBalance, inputProof);
        _encryptedBalance[encryptedWallet] = encryptedBalance;

        FHE.allow(_encryptedBalance[encryptedWallet], msg.sender);
        FHE.allowThis(_encryptedBalance[encryptedWallet]);
    }

    function increaseEncryptedBalance(
        eaddress encryptedWallet,
        externalEuint128 externalEncryptedValue,
        bytes calldata inputProof
    ) external {
        euint128 encryptedValue = FHE.fromExternal(externalEncryptedValue, inputProof);
        _encryptedBalance[encryptedWallet] = FHE.add(_encryptedBalance[encryptedWallet], encryptedValue);

        FHE.allow(_encryptedBalance[encryptedWallet], msg.sender);
        FHE.allowThis(_encryptedBalance[encryptedWallet]);
    }

    function decreaseEncryptedBalance(
        eaddress encryptedWallet,
        externalEuint128 externalEncryptedValue,
        bytes calldata inputProof
    ) external {
        euint128 encryptedValue = FHE.fromExternal(externalEncryptedValue, inputProof);
        _encryptedBalance[encryptedWallet] = FHE.sub(_encryptedBalance[encryptedWallet], encryptedValue);

        FHE.allow(_encryptedBalance[encryptedWallet], msg.sender);
        FHE.allowThis(_encryptedBalance[encryptedWallet]);
    }
}
