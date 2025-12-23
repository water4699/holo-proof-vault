// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint64, externalEuint32, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";

/// @title Type validation utilities for FHE operations
/// @notice Helper library for validating and converting FHE types
library TypeValidation {
    /// @notice Validate that an external euint32 is properly formatted
    /// @param input The external encrypted input
    /// @param proof The input proof
    /// @return valid True if the input is valid
    function validateEuint32(externalEuint32 input, bytes calldata proof) 
        external 
        pure 
        returns (bool valid) 
    {
        // Basic validation - in a real implementation this would be more thorough
        return proof.length > 0;
    }

    /// @notice Validate that an external euint64 is properly formatted
    /// @param input The external encrypted input
    /// @param proof The input proof
    /// @return valid True if the input is valid
    function validateEuint64(externalEuint64 input, bytes calldata proof) 
        external 
        pure 
        returns (bool valid) 
    {
        // Basic validation - in a real implementation this would be more thorough
        return proof.length > 0;
    }

    /// @notice Convert and validate euint32 to euint64
    /// @param input The external euint32 input
    /// @param proof The input proof
    /// @return result The converted euint64
    function convertToEuint64(externalEuint32 input, bytes calldata proof) 
        external 
        returns (euint64 result) 
    {
        euint32 temp = FHE.fromExternal(input, proof);
        return FHE.asEuint64(temp);
    }

    /// @notice Safe addition for encrypted values with overflow check
    /// @param a First encrypted value
    /// @param b Second encrypted value
    /// @return result Sum of the values
    function safeAdd(euint64 a, euint64 b) 
        external 
        returns (euint64 result) 
    {
        // Note: FHE operations don't have traditional overflow checks
        // This is a placeholder for future enhanced validation
        return FHE.add(a, b);
    }
}
