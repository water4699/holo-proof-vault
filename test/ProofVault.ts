import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { ProofVault, ProofVault__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ProofVault")) as ProofVault__factory;
  const proofVaultContract = (await factory.deploy()) as ProofVault;
  const proofVaultContractAddress = await proofVaultContract.getAddress();

  return { proofVaultContract, proofVaultContractAddress };
}

// Helper function for permission validation testing
function validatePermissionAccess(contract: ProofVault, user: HardhatEthersSigner, productId: bigint): boolean {
  try {
    // This would test if user has permission to access encrypted data
    return true; // Simplified for this example
  } catch (error) {
    return false;
  }
}

// ABI compatibility validation helper
function validateABICompatibility(abi: any): boolean {
  try {
    // Check if required functions exist in ABI
    const requiredFunctions = ['addProduct', 'verifyProduct', 'getProductInfo', 'getTotalProducts'];
    return requiredFunctions.every(func => 
      abi.some((item: any) => item.name === func && item.type === 'function')
    );
  } catch (error) {
    return false;
  }
}

describe("ProofVault", function () {
  let signers: Signers;
  let proofVaultContract: ProofVault;
  let proofVaultContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ proofVaultContract, proofVaultContractAddress } = await deployFixture());
  });

  it("should initialize with zero products", async function () {
    const totalProducts = await proofVaultContract.getTotalProducts();
    expect(totalProducts).to.eq(0);
  });

  it("should add a product with encrypted data and signature", async function () {
    const productName = "Premium Smart Watch";
    const productImageUrl = "https://example.com/watch.jpg";
    const clearPrice = 450000000000000000n; // 0.45 ETH in wei
    const clearCertHash = 123456789;

    // Create encrypted input with price and certificate hash
    const encryptedInput = await fhevm
      .createEncryptedInput(proofVaultContractAddress, signers.alice.address)
      .add64(clearPrice)
      .add32(clearCertHash)
      .encrypt();

    // Generate nonce and create signature
    const nonce = BigInt(Date.now());
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const messageHash = ethers.solidityPackedKeccak256(
      ["string", "string", "uint256", "address", "uint256"],
      ["Upload product", productName, nonce, proofVaultContractAddress, chainId]
    );
    const signature = await signers.alice.signMessage(ethers.getBytes(messageHash));

    // Add product
    const tx = await proofVaultContract
      .connect(signers.alice)
      .addProduct(
        productName,
        encryptedInput.handles[0],
        productImageUrl,
        encryptedInput.handles[1],
        encryptedInput.inputProof,
        nonce,
        signature
      );
    await tx.wait();

    // Verify product was added
    const totalProducts = await proofVaultContract.getTotalProducts();
    expect(totalProducts).to.eq(1);

    // Check product info
    const [name, imageUrl, seller, timestamp] = await proofVaultContract.getProductInfo(0);
    expect(name).to.eq(productName);
    expect(imageUrl).to.eq(productImageUrl);
    expect(seller).to.eq(signers.alice.address);
    expect(timestamp).to.be.gt(0);
  });

  it("should allow seller to decrypt their product data", async function () {
    const productName = "Luxury Handbag";
    const productImageUrl = "https://example.com/handbag.jpg";
    const clearPrice = 820000000000000000n; // 0.82 ETH in wei
    const clearCertHash = 987654321;

    // Create encrypted input
    const encryptedInput = await fhevm
      .createEncryptedInput(proofVaultContractAddress, signers.alice.address)
      .add64(clearPrice)
      .add32(clearCertHash)
      .encrypt();

    // Generate signature
    const nonce = BigInt(Date.now());
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const messageHash = ethers.solidityPackedKeccak256(
      ["string", "string", "uint256", "address", "uint256"],
      ["Upload product", productName, nonce, proofVaultContractAddress, chainId]
    );
    const signature = await signers.alice.signMessage(ethers.getBytes(messageHash));

    // Add product
    const tx = await proofVaultContract
      .connect(signers.alice)
      .addProduct(
        productName,
        encryptedInput.handles[0],
        productImageUrl,
        encryptedInput.handles[1],
        encryptedInput.inputProof,
        nonce,
        signature
      );
    await tx.wait();

    // Get encrypted data
    const [encPrice, encCertHash] = await proofVaultContract.getProductEncryptedData(0);

    // Decrypt price
    const decryptedPrice = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encPrice,
      proofVaultContractAddress,
      signers.alice
    );
    expect(decryptedPrice).to.eq(clearPrice);

    // Decrypt certificate hash
    const decryptedCertHash = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encCertHash,
      proofVaultContractAddress,
      signers.alice
    );
    expect(decryptedCertHash).to.eq(clearCertHash);
  });

  it("should allow verification and grant access to verifier", async function () {
    const productName = "Wireless Headphones";
    const productImageUrl = "https://example.com/headphones.jpg";
    const clearPrice = 280000000000000000n; // 0.28 ETH in wei
    const clearCertHash = 111222333;

    // Create encrypted input
    const encryptedInput = await fhevm
      .createEncryptedInput(proofVaultContractAddress, signers.alice.address)
      .add64(clearPrice)
      .add32(clearCertHash)
      .encrypt();

    // Generate signature for adding product
    const addNonce = BigInt(Date.now());
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const addMessageHash = ethers.solidityPackedKeccak256(
      ["string", "string", "uint256", "address", "uint256"],
      ["Upload product", productName, addNonce, proofVaultContractAddress, chainId]
    );
    const addSignature = await signers.alice.signMessage(ethers.getBytes(addMessageHash));

    // Alice adds product
    let tx = await proofVaultContract
      .connect(signers.alice)
      .addProduct(
        productName,
        encryptedInput.handles[0],
        productImageUrl,
        encryptedInput.handles[1],
        encryptedInput.inputProof,
        addNonce,
        addSignature
      );
    await tx.wait();

    // Generate signature for verifying product
    const verifyNonce = BigInt(Date.now() + 1000); // Different nonce
    const verifyMessageHash = ethers.solidityPackedKeccak256(
      ["string", "uint256", "uint256", "address", "uint256"],
      ["Verify product", 0, verifyNonce, proofVaultContractAddress, chainId]
    );
    const verifySignature = await signers.bob.signMessage(ethers.getBytes(verifyMessageHash));

    // Bob verifies the product
    tx = await proofVaultContract.connect(signers.bob).verifyProduct(0, verifyNonce, verifySignature);
    await tx.wait();

    // Bob should now be able to decrypt the data
    const [encPrice, encCertHash] = await proofVaultContract.getProductEncryptedData(0);

    const decryptedPrice = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encPrice,
      proofVaultContractAddress,
      signers.bob
    );
    expect(decryptedPrice).to.eq(clearPrice);

    const decryptedCertHash = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encCertHash,
      proofVaultContractAddress,
      signers.bob
    );
    expect(decryptedCertHash).to.eq(clearCertHash);
  });

  it("should track seller products", async function () {
    const productName1 = "Product 1";
    const productName2 = "Product 2";
    const productImageUrl = "https://example.com/product.jpg";
    const clearPrice = 100000000000000000n;
    const clearCertHash = 123;

    // Alice adds two products
    for (let i = 0; i < 2; i++) {
      const encryptedInput = await fhevm
        .createEncryptedInput(proofVaultContractAddress, signers.alice.address)
        .add64(clearPrice)
        .add32(clearCertHash)
        .encrypt();

      const productName = i === 0 ? productName1 : productName2;
      const nonce = BigInt(Date.now() + i * 1000);
      const chainId = (await ethers.provider.getNetwork()).chainId;
      const messageHash = ethers.solidityPackedKeccak256(
        ["string", "string", "uint256", "address", "uint256"],
        ["Upload product", productName, nonce, proofVaultContractAddress, chainId]
      );
      const signature = await signers.alice.signMessage(ethers.getBytes(messageHash));

      const tx = await proofVaultContract
        .connect(signers.alice)
        .addProduct(
          productName,
          encryptedInput.handles[0],
          productImageUrl,
          encryptedInput.handles[1],
          encryptedInput.inputProof,
          nonce,
          signature
        );
      await tx.wait();
    }

    // Check Alice's products
    const aliceProducts = await proofVaultContract.getSellerProducts(signers.alice.address);
    expect(aliceProducts.length).to.eq(2);
    expect(aliceProducts[0]).to.eq(0);
    expect(aliceProducts[1]).to.eq(1);

    // Bob should have no products
    const bobProducts = await proofVaultContract.getSellerProducts(signers.bob.address);
    expect(bobProducts.length).to.eq(0);
  });

  it("should revert when getting info for non-existent product", async function () {
    await expect(proofVaultContract.getProductInfo(999)).to.be.revertedWith("Product does not exist");
  });

  it("should revert when verifying non-existent product", async function () {
    const nonce = BigInt(Date.now());
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const messageHash = ethers.solidityPackedKeccak256(
      ["string", "uint256", "uint256", "address", "uint256"],
      ["Verify product", 999, nonce, proofVaultContractAddress, chainId]
    );
    const signature = await signers.alice.signMessage(ethers.getBytes(messageHash));
    
    await expect(
      proofVaultContract.verifyProduct(999, nonce, signature)
    ).to.be.revertedWith("Product does not exist");
  });

  it("should check product existence", async function () {
    expect(await proofVaultContract.productExists(0)).to.be.false;

    // Add a product
    const encryptedInput = await fhevm
      .createEncryptedInput(proofVaultContractAddress, signers.alice.address)
      .add64(100000000000000000n)
      .add32(123)
      .encrypt();

    const nonce = BigInt(Date.now());
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const messageHash = ethers.solidityPackedKeccak256(
      ["string", "string", "uint256", "address", "uint256"],
      ["Upload product", "Test Product", nonce, proofVaultContractAddress, chainId]
    );
    const signature = await signers.alice.signMessage(ethers.getBytes(messageHash));

    const tx = await proofVaultContract
      .connect(signers.alice)
      .addProduct(
        "Test Product",
        encryptedInput.handles[0],
        "https://example.com/test.jpg",
        encryptedInput.handles[1],
        encryptedInput.inputProof,
        nonce,
        signature
      );
    await tx.wait();

    expect(await proofVaultContract.productExists(0)).to.be.true;
    expect(await proofVaultContract.productExists(1)).to.be.false;
  });

  it("should reject add product with invalid signature", async function () {
    const productName = "Invalid Signature Product";
    const encryptedInput = await fhevm
      .createEncryptedInput(proofVaultContractAddress, signers.alice.address)
      .add64(100000000000000000n)
      .add32(123)
      .encrypt();

    const nonce = BigInt(Date.now());
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const messageHash = ethers.solidityPackedKeccak256(
      ["string", "string", "uint256", "address", "uint256"],
      ["Upload product", productName, nonce, proofVaultContractAddress, chainId]
    );
    
    // Bob signs but Alice tries to use it
    const signature = await signers.bob.signMessage(ethers.getBytes(messageHash));

    await expect(
      proofVaultContract
        .connect(signers.alice)
        .addProduct(
          productName,
          encryptedInput.handles[0],
          "https://example.com/test.jpg",
          encryptedInput.handles[1],
          encryptedInput.inputProof,
          nonce,
          signature
        )
    ).to.be.revertedWith("Invalid signature");
  });

  it("should reject reused nonce", async function () {
    const productName = "First Product";
    const encryptedInput = await fhevm
      .createEncryptedInput(proofVaultContractAddress, signers.alice.address)
      .add64(100000000000000000n)
      .add32(123)
      .encrypt();

    const nonce = BigInt(Date.now());
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const messageHash = ethers.solidityPackedKeccak256(
      ["string", "string", "uint256", "address", "uint256"],
      ["Upload product", productName, nonce, proofVaultContractAddress, chainId]
    );
    const signature = await signers.alice.signMessage(ethers.getBytes(messageHash));

    // First product upload should succeed
    let tx = await proofVaultContract
      .connect(signers.alice)
      .addProduct(
        productName,
        encryptedInput.handles[0],
        "https://example.com/test.jpg",
        encryptedInput.handles[1],
        encryptedInput.inputProof,
        nonce,
        signature
      );
    await tx.wait();

    // Try to reuse the same nonce (even with a new signature)
    const encryptedInput2 = await fhevm
      .createEncryptedInput(proofVaultContractAddress, signers.alice.address)
      .add64(200000000000000000n)
      .add32(456)
      .encrypt();

    await expect(
      proofVaultContract
        .connect(signers.alice)
        .addProduct(
          "Second Product",
          encryptedInput2.handles[0],
          "https://example.com/test2.jpg",
          encryptedInput2.handles[1],
          encryptedInput2.inputProof,
          nonce, // Reusing same nonce
          signature
        )
    ).to.be.revertedWith("Nonce already used");
  });
});
