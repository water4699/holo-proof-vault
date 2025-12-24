"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Shield, Loader2 } from "lucide-react";
import { useAccount, useSignMessage } from "wagmi";
import { toast } from "sonner";
import { useProofVault } from "@/hooks/useProofVault";
import { useProducts } from "@/contexts/ProductContext";
import { useFhevm } from "@/fhevm/useFhevm";
import { usePublicClient } from "wagmi";

export const UploadProductDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [certificate, setCertificate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { addProduct: addProductToChain, getUploadMessageHash, contractAddress, totalProducts } = useProofVault();
  const { addProduct: addProductToContext } = useProducts();
  const publicClient = usePublicClient();
  const { instance: fhevmInstance, status: fhevmStatus, error: fhevmError } = useFhevm({
    provider: publicClient,
    chainId: chainId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!contractAddress) {
      toast.error("Contract not deployed on this network");
      return;
    }

    if (!name || !price || !certificate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check FHEVM status before proceeding
    if (fhevmStatus === "loading") {
      toast.error("FHEVM is still initializing. Please wait a moment and try again.");
      return;
    }

    if (fhevmStatus === "error") {
      toast.error(`FHEVM initialization failed: ${fhevmError?.message || "Unknown error"}`);
      return;
    }

    if (!fhevmInstance) {
      toast.error("FHEVM not ready. Please refresh the page and try again.");
      return;
    }

    try {
      setIsLoading(true);

      // Step 1: Show pre-signature message
      const preSignToast = toast.info("🔐 Preparing signature request...", { duration: 2000 });

      // Generate nonce
      const nonce = BigInt(Date.now());

      // Create message hash for signature
      const messageHash = getUploadMessageHash(name, nonce);
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

      // Step 3: Encrypt data with FHEVM
      toast.info("🔐 Encrypting product data...");

      // Create encrypted input using FHEVM
      // Use price in Gwei (1e9) instead of Wei (1e18) to avoid uint64 overflow
      // uint64 max is ~18.4 ETH in Wei, but ~18.4 billion ETH in Gwei
      const priceInGwei = BigInt(Math.floor(parseFloat(price) * 1e9));
      // Simple hash of certificate for demo
      const certHashValue = certificate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      const encryptedInput = fhevmInstance.createEncryptedInput(contractAddress!, address!);
      encryptedInput.add64(priceInGwei);
      encryptedInput.add32(certHashValue);
      const { handles, inputProof } = await encryptedInput.encrypt();
      
      // Convert Uint8Array to hex string
      const toHexString = (bytes: Uint8Array) => '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const encryptedPrice = toHexString(handles[0]) as `0x${string}`;
      const encryptedCert = toHexString(handles[1]) as `0x${string}`;
      const inputProofHex = toHexString(inputProof) as `0x${string}`;

      // Call contract and wait for hash
      await addProductToChain({
        name,
        priceWei: encryptedPrice,
        imageUrl: image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        certificateHash: encryptedCert,
        inputProof: inputProofHex,
        nonce,
        signature: signature as `0x${string}`,
      });

      // Get the product ID that was just created (current total is the new product's ID)
      const newProductId = totalProducts;

      // Add to local context with blockchain ID
      addProductToContext({
        name,
        price: `${price} ETH`,
        image: image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        verified: false,
        seller: address,
        certificate: certificate,
        onChainId: newProductId,
        isOnChain: true,
      });

      toast.success("🎉 Product uploaded successfully!");
      setOpen(false);
      setName("");
      setPrice("");
      setImage("");
      setCertificate("");

    } catch (error: unknown) {
      console.error("Upload error:", error);
      const err = error as { message?: string; shortMessage?: string };
      if (err.message?.includes("User rejected") || err.message?.includes("User denied")) {
        toast.error("❌ Upload cancelled by user");
      } else if (err.message?.includes("Nonce already used")) {
        toast.error("❌ This transaction was already processed. Please try again.");
      } else {
        toast.error(`❌ Upload failed: ${err.shortMessage || err.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 btn-shine bg-gradient-to-r from-primary to-accent hover:opacity-90">
          <Upload className="h-4 w-4" />
          Upload Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass-card">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 holographic-seal rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Upload New Product</DialogTitle>
              <DialogDescription>
                Add a product with FHE-encrypted certificate
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Product Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Premium Smart Watch"
              className="bg-background/50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium">Price (ETH)</Label>
            <Input
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.45"
              className="bg-background/50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">Image URL (optional)</Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="bg-background/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="certificate" className="text-sm font-medium">Authenticity Certificate</Label>
            <Input
              id="certificate"
              value={certificate}
              onChange={(e) => setCertificate(e.target.value)}
              placeholder="Enter certificate data to encrypt"
              className="bg-background/50"
              required
            />
          </div>
          
          {fhevmStatus === "loading" && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Initializing FHE</span>
              </div>
              <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80">
                Please wait while the encryption system initializes...
              </p>
            </div>
          )}

          {fhevmStatus === "error" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Encryption Error</span>
              </div>
              <p className="text-xs text-red-600/80 dark:text-red-400/80">
                {fhevmError?.message || "Failed to initialize. Please refresh."}
              </p>
            </div>
          )}

          {fhevmStatus === "ready" && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Ready to Encrypt</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your certificate will be encrypted with FHE before storing on-chain.
              </p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full gap-2 btn-shine bg-gradient-to-r from-primary to-accent hover:opacity-90" 
            disabled={isLoading || !isConnected || fhevmStatus !== "ready"}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Encrypting & Uploading...
              </>
            ) : fhevmStatus === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : fhevmStatus === "error" ? (
              "Error - Refresh Page"
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload & Encrypt
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
