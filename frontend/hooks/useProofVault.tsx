"use client";

import { useAccount, useWriteContract, useReadContract, useChainId, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, encodePacked } from "viem";
import { ProofVaultABI } from "@/abi/ProofVaultABI";
import { ProofVaultAddresses } from "@/abi/ProofVaultAddresses";

export interface AddProductParams {
  name: string;
  priceWei: `0x${string}`;
  imageUrl: string;
  certificateHash: `0x${string}`;
  inputProof: `0x${string}`;
  nonce: bigint;  // Fixed: changed back to bigint
  signature: `0x${string}`;
}

export interface VerifyProductParams {
  productId: bigint;
  nonce: bigint;
  signature: `0x${string}`;
}

export function useProofVault() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContract, isPending, isSuccess, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
  });
  
  // Get contract address for current chain
  const contractAddress = ((ProofVaultAddresses as any)[chainId]?.address as `0x${string}`) || undefined;

  // Read total products
  const { data: totalProducts } = useReadContract({
    address: contractAddress,
    abi: ProofVaultABI.abi,
    functionName: 'getTotalProducts',
  });

  // Add product with signature
  const addProduct = async (params: AddProductParams): Promise<`0x${string}`> => {
    if (!contractAddress) {
      throw new Error("Contract not deployed on this network");
    }
    if (!address) {
      throw new Error("Wallet not connected");
    }

    return new Promise((resolve, reject) => {
      writeContract({
        address: contractAddress,
        abi: ProofVaultABI.abi,
        functionName: 'addProduct',
        args: [
          params.name,
          params.priceWei,
          params.imageUrl,
          params.certificateHash,
          params.inputProof,
          params.nonce,
          params.signature,
        ],
      }, {
        onSuccess: (hash) => resolve(hash),
        onError: (error) => reject(error),
      });
    });
  };

  // Verify product with signature
  const verifyProduct = async (params: VerifyProductParams): Promise<`0x${string}`> => {
    if (!contractAddress) {
      throw new Error("Contract not deployed on this network");
    }
    if (!address) {
      throw new Error("Wallet not connected");
    }

    return new Promise((resolve, reject) => {
      writeContract({
        address: contractAddress,
        abi: ProofVaultABI.abi,
        functionName: 'verifyProduct',
        args: [params.productId, params.nonce, params.signature],
      }, {
        onSuccess: (hash) => resolve(hash),
        onError: (error) => reject(error),
      });
    });
  };

  // Get product info
  const getProductInfo = (productId: bigint) => {
    return useReadContract({
      address: contractAddress,
      abi: ProofVaultABI.abi,
      functionName: 'getProductInfo',
      args: [productId],
    });
  };

  // Generate message hash for upload signature
  const getUploadMessageHash = (name: string, nonce: bigint) => {
    if (!contractAddress || !chainId) return null;
    return keccak256(
      encodePacked(
        ["string", "string", "uint256", "address", "uint256"],
        ["Upload product", name, nonce, contractAddress, BigInt(chainId)],
      ),
    );
  };

  // Enhanced validation for input parameters
  const validateProductParams = (params: AddProductParams): boolean => {
    return params.name.length > 0 && 
           params.imageUrl.length > 0 && 
           params.signature.startsWith('0x') &&
           params.inputProof.startsWith('0x');
  };

  // Enhanced error handling with user-friendly messages
  const getErrorMessage = (error: any): string => {
    if (error.message?.includes("User rejected")) {
      return "Transaction cancelled by user";
    }
    if (error.message?.includes("insufficient funds")) {
      return "Insufficient funds for transaction";
    }
    if (error.message?.includes("Nonce already used")) {
      return "This transaction was already processed";
    }
    if (error.message?.includes("Invalid signature")) {
      return "Invalid signature provided";
    }
    return error.message || "Transaction failed";
  };

  // Generate message hash for verify signature
  const getVerifyMessageHash = (productId: bigint, nonce: bigint) => {
    if (!contractAddress || !chainId) return null;
    return keccak256(
      encodePacked(
        ["string", "uint256", "uint256", "address", "uint256"],
        ["Verify product", productId, nonce, contractAddress, BigInt(chainId)],
      ),
    );
  };
  
  return {
    contractAddress,
    totalProducts: totalProducts ? Number(totalProducts) : 0,
    addProduct,
    verifyProduct,
    getProductInfo,
    getUploadMessageHash,
    getVerifyMessageHash,
    validateProductParams,
    getErrorMessage,
    isPending,
    isConfirming,
    isConfirmed,
    transactionHash: hash,
  };
}
