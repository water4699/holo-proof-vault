// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint64, ebool, externalEuint32, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {LocalConfig} from "./LocalConfig.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @title ProofVault - Encrypted Product Authentication System
/// @notice Stores encrypted product authenticity certificates on-chain with privacy-preserving verification
/// @dev Implements a complete encryption/decryption loop for product authentication using FHEVM
contract ProofVault is LocalConfig {
    struct Product {
        string name;
        euint64 priceWei; // Price in wei (encrypted)
        string imageUrl;
        euint32 certificateHash; // Encrypted certificate hash
        address seller;
        uint256 timestamp;
        bool exists;
    }

    // Product ID counter
    uint256 private _productIdCounter;

    // Mapping from product ID to Product
    mapping(uint256 => Product) private _products;

    // Mapping from seller to their product IDs
    mapping(address => uint256[]) private _sellerProducts;

    // Mapping to track used nonces for signature replay protection
    mapping(address => mapping(uint256 => bool)) public usedNonces;

    // Gas optimization: track seller product count
    mapping(address => uint256) private _sellerProductCount;

    // Events
    event ProductAdded(
        uint256 indexed productId,
        address indexed seller,
        string name,
        uint256 timestamp
    );

    event ProductVerified(
        uint256 indexed productId,
        address indexed verifier,
        uint256 timestamp
    );

    /// @notice Add a new product with encrypted price and certificate (requires signature)
    /// @param name Product name
    /// @param priceWei External encrypted price in wei
    /// @param imageUrl Product image URL
    /// @param certificateHash External encrypted certificate hash
    /// @param inputProof The encryption input proof
    /// @param nonce Unique nonce for replay protection
    /// @param signature User's signature authorizing this product upload
    /// @return productId The ID of the newly created product
    function addProduct(
        string calldata name,
        externalEuint64 priceWei,
        string calldata imageUrl,
        externalEuint32 certificateHash,
        bytes calldata inputProof,
        uint256 nonce,
        bytes calldata signature
    ) external returns (uint256 productId) {
        require(bytes(name).length > 0, "Product name cannot be empty");
        require(bytes(imageUrl).length > 0, "Image URL cannot be empty");
        require(!usedNonces[msg.sender][nonce], "Nonce already used");
        require(nonce < type(uint256).max, "Invalid nonce value");

        // Verify signature
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "Upload product",
                name,
                nonce,
                address(this),
                block.chainid
            )
        );
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        require(signer == msg.sender, "Invalid signature");
        require(signer != address(0), "Invalid signer");

        // Mark nonce as used
        usedNonces[msg.sender][nonce] = true;

        // Convert external encrypted inputs to internal encrypted types
        euint64 encPrice = FHE.fromExternal(priceWei, inputProof);
        euint32 encCertHash = FHE.fromExternal(certificateHash, inputProof);

        // Increment product ID
        productId = _productIdCounter++;

        // Store product
        _products[productId] = Product({
            name: name,
            priceWei: encPrice,
            imageUrl: imageUrl,
            certificateHash: encCertHash,
            seller: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        // Add to seller's products
        _sellerProducts[msg.sender].push(productId);

        // Allow contract and seller to access encrypted data
        FHE.allowThis(_products[productId].priceWei);
        FHE.allowThis(_products[productId].certificateHash);
        FHE.allow(_products[productId].priceWei, msg.sender);
        FHE.allow(_products[productId].certificateHash, msg.sender);

        emit ProductAdded(productId, msg.sender, name, block.timestamp);
    }

    /// @notice Get product public information
    /// @param productId The product ID
    /// @return name Product name
    /// @return imageUrl Product image URL
    /// @return seller Seller address
    /// @return timestamp Creation timestamp
    function getProductInfo(uint256 productId)
        external
        view
        returns (
            string memory name,
            string memory imageUrl,
            address seller,
            uint256 timestamp
        )
    {
        require(_products[productId].exists, "Product does not exist");
        Product storage product = _products[productId];
        return (product.name, product.imageUrl, product.seller, product.timestamp);
    }

    /// @notice Get encrypted product data (price and certificate)
    /// @param productId The product ID
    /// @return priceWei Encrypted price in wei
    /// @return certificateHash Encrypted certificate hash
    /// @dev Only callable by the seller or contract
    function getProductEncryptedData(uint256 productId)
        external
        view
        returns (euint64 priceWei, euint32 certificateHash)
    {
        require(_products[productId].exists, "Product does not exist");
        Product storage product = _products[productId];
        return (product.priceWei, product.certificateHash);
    }

    /// @notice Verify and grant access to encrypted certificate for a user (requires signature)
    /// @param productId The product ID
    /// @param nonce Unique nonce for replay protection
    /// @param signature User's signature authorizing this verification/decryption
    /// @dev Allows the caller to decrypt the certificate after verification
    function verifyProduct(uint256 productId, uint256 nonce, bytes calldata signature) external {
        require(_products[productId].exists, "Product does not exist");
        require(!usedNonces[msg.sender][nonce], "Nonce already used");

        // Verify signature
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "Verify product",
                productId,
                nonce,
                address(this),
                block.chainid
            )
        );
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        require(signer == msg.sender, "Invalid signature");

        // Mark nonce as used
        usedNonces[msg.sender][nonce] = true;
        
        Product storage product = _products[productId];
        
        // Grant caller permission to decrypt the encrypted data
        FHE.allow(product.priceWei, msg.sender);
        FHE.allow(product.certificateHash, msg.sender);

        emit ProductVerified(productId, msg.sender, block.timestamp);
    }

    /// @notice Get total number of products
    /// @return Total product count
    function getTotalProducts() external view returns (uint256) {
        return _productIdCounter;
    }

    /// @notice Get product IDs for a specific seller
    /// @param seller The seller address
    /// @return Array of product IDs
    function getSellerProducts(address seller) external view returns (uint256[] memory) {
        return _sellerProducts[seller];
    }

    /// @notice Check if a product exists
    /// @param productId The product ID
    /// @return True if product exists
    function productExists(uint256 productId) external view returns (bool) {
        return _products[productId].exists;
    }
}
