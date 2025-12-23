// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {LocalConfig} from "./LocalConfig.sol";

/// @title A simple FHE counter contract
/// @author fhevm-hardhat-template
/// @notice A very basic example contract showing how to work with encrypted data using FHEVM.
contract FHECounter is LocalConfig {
    euint64 private _count;

    /// @notice Returns the current count
    /// @return The current encrypted count
    function getCount() external view returns (euint64) {
        return _count;
    }

    /// @notice Increments the counter by a specified encrypted value.
    /// @param inputEuint64 the encrypted input value
    /// @param inputProof the input proof
    /// @dev This example omits overflow/underflow checks for simplicity and readability.
    /// In a production contract, proper range checks should be implemented.
    function increment(externalEuint64 inputEuint64, bytes calldata inputProof) external {
        euint64 encryptedEuint64 = FHE.fromExternal(inputEuint64, inputProof);

        _count = FHE.add(_count, encryptedEuint64);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    /// @notice Decrements the counter by a specified encrypted value.
    /// @param inputEuint64 the encrypted input value
    /// @param inputProof the input proof
    /// @dev This example omits overflow/underflow checks for simplicity and readability.
    /// In a production contract, proper range checks should be implemented.
    function decrement(externalEuint64 inputEuint64, bytes calldata inputProof) external {
        euint64 encryptedEuint64 = FHE.fromExternal(inputEuint64, inputProof);

        _count = FHE.sub(_count, encryptedEuint64);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}
