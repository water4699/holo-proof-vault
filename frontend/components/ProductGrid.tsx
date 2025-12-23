"use client";

import { ProductCard } from "./ProductCard";
import { UploadProductDialog } from "./UploadProductDialog";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Package, Trash2, Sparkles } from "lucide-react";

// Default products to show when no user products exist (demo only - not on blockchain)
const defaultProducts = [
  {
    id: "demo-1",
    name: "Premium Smart Watch",
    price: "0.45 ETH",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    verified: false,
    certificate: "cert_encrypted_a1b2c3d4e5f6",
    isOnChain: false,
  },
  {
    id: "demo-2",
    name: "Luxury Designer Handbag",
    price: "0.82 ETH",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500",
    verified: false,
    certificate: "cert_verified_1a2b3c4d5e6f7g8h",
    isOnChain: false,
  },
  {
    id: "demo-3",
    name: "Wireless Headphones Pro",
    price: "0.28 ETH",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    verified: false,
    certificate: "cert_encrypted_9x8y7z6w5v",
    isOnChain: false,
  },
  {
    id: "demo-4",
    name: "Limited Edition Sneakers",
    price: "0.65 ETH",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    verified: false,
    certificate: "cert_encrypted_p9o8i7u6y5",
    isOnChain: false,
  },
];

export const ProductGrid = () => {
  const { products, clearProducts } = useProducts();
  const allProducts = products.length > 0 ? products : defaultProducts;

  return (
    <section id="products" className="scroll-mt-20">
      {/* Section Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Marketplace</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Authenticated Products
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Each product is secured with blockchain verification and holographic seals. 
              Click on any product to verify its authenticity.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <UploadProductDialog />
            {products.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearProducts}
                className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Products Count */}
      {products.length > 0 && (
        <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 w-fit">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{products.length}</span> products uploaded on-chain
          </span>
        </div>
      )}
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {/* Empty State for Demo Products */}
      {products.length === 0 && (
        <div className="mt-8 p-6 rounded-2xl border border-dashed border-border/50 bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">
            💡 These are demo products. Upload your own product to test on-chain verification with FHE encryption.
          </p>
        </div>
      )}
    </section>
  );
};
