"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Unlock, Loader2, CheckCircle } from "lucide-react";
import { Product, useProducts } from "@/contexts/ProductContext";
import { useAccount, useSignMessage } from "wagmi";
import { toast } from "sonner";
import { useProofVault } from "@/hooks/useProofVault";

interface ProductDetailDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductDetailDialog = ({ product, open, onOpenChange }: ProductDetailDialogProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { verifyProduct: verifyProductContext } = useProducts();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { verifyProduct, getVerifyMessageHash } = useProofVault();

  const handleVerify = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to verify products");
      return;
    }

    // Check if product is on blockchain
    if (!product.isOnChain || product.onChainId === undefined) {
      toast.error("⚠️ This is a demo product. Please upload a real product to verify it on-chain.");
      return;
    }

    try {
      setIsVerifying(true);

      // Step 1: Show pre-signature message
      const preSignToast = toast.info("🔐 Preparing verification request...", { duration: 2000 });

      // Generate nonce
      const nonce = BigInt(Date.now());
      const productId = BigInt(product.onChainId);

      // Create message hash for signature
      const messageHash = getVerifyMessageHash(productId, nonce);
      if (!messageHash) {
        throw new Error("Failed to generate message hash");
      }

      // Small delay to ensure toast is visible
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.dismiss(preSignToast);

      // Step 2: Request signature
      toast.info("✍️ Please sign the message in your wallet...");
      const signature = await signMessageAsync({
        message: { raw: messageHash as `0x${string}` },
      });

      // Step 3: Submit transaction
      toast.info("🔓 Submitting verification to blockchain...");

      // Call contract and wait for hash
      await verifyProduct({
        productId,
        nonce,
        signature: signature as `0x${string}`,
      });

      // Update local state to show verified
      verifyProductContext(product.id);

      toast.success("🎉 Certificate verified and decrypted!");

    } catch (error: unknown) {
      console.error("Verify error:", error);
      const err = error as { message?: string; shortMessage?: string };
      if (err.message?.includes("User rejected") || err.message?.includes("User denied")) {
        toast.error("❌ Verification cancelled by user");
      } else if (err.message?.includes("Nonce already used")) {
        toast.error("❌ This verification was already processed. Please try again.");
      } else {
        toast.error(`❌ Verification failed: ${err.shortMessage || err.message || "Unknown error"}`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.name}
            {product.verified && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </DialogTitle>
          <DialogDescription>
            {product.verified 
              ? "This product has been verified on-chain" 
              : "View detailed information and verify the authenticity certificate"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <Image 
              src={product.image} 
              alt={product.name}
              fill
              className="object-cover"
              unoptimized
            />
            {product.verified && (
              <div className="absolute top-4 right-4 bg-green-500 rounded-full p-3 shadow-lg">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">{product.price}</span>
              {product.verified ? (
                <Badge className="gap-1 bg-green-500 hover:bg-green-600">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Encrypted
                </Badge>
              )}
            </div>
            
            {product.seller && (
              <p className="text-sm text-muted-foreground">
                Seller: {product.seller.slice(0, 6)}...{product.seller.slice(-4)}
              </p>
            )}
            
            <div className="pt-4 space-y-2">
              <h3 className="font-semibold">Authenticity Certificate</h3>
              {product.verified ? (
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Unlock className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                      ✓ Certificate Decrypted Successfully
                    </span>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded p-3 border">
                    <p className="text-xs text-muted-foreground mb-1">Original Certificate:</p>
                    <p className="text-sm font-mono break-all text-foreground">
                      {product.certificate}
                    </p>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    This certificate has been verified on the blockchain and decrypted for your viewing.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Encrypted Certificate</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet and verify on-chain to decrypt the authenticity certificate.
                  </p>
                </div>
              )}
            </div>
            
            {!product.verified && product.isOnChain && (
              <Button onClick={handleVerify} className="w-full gap-2 bg-primary hover:bg-primary/90" disabled={isVerifying || !isConnected}>
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying & Decrypting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Verify & Decrypt Certificate
                  </>
                )}
              </Button>
            )}
            
            {product.verified && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800 text-center">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  ✓ This product is verified and authentic
                </p>
              </div>
            )}
            
            {!product.isOnChain && (
              <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground text-center">
                  💡 This is a demo product. Upload a real product to test on-chain verification.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
