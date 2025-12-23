"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Sparkles } from "lucide-react";
import { Product } from "@/contexts/ProductContext";
import { ProductDetailDialog } from "./ProductDetailDialog";

export const ProductCard = ({ id, name, price, image, verified, seller, certificate, isOnChain, onChainId }: Product) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const isPriorityImage = id === "demo-3" || id === "demo-1";

  return (
    <>
      <Card 
        className="group overflow-hidden border-border/50 bg-card/70 backdrop-blur-sm cursor-pointer card-hover holographic-border"
        onClick={() => setDetailOpen(true)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image 
            src={image} 
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            unoptimized
            priority={isPriorityImage}
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            {verified ? (
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
            ) : (
              <div className="w-12 h-12 holographic-seal rounded-full flex items-center justify-center shadow-lg">
                <Lock className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          {/* On-chain indicator */}
          {isOnChain && (
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] text-white font-medium">On-Chain</span>
              </div>
            </div>
          )}

          {/* Hover action hint */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-xs text-white/80 text-center py-2 px-3 rounded-lg bg-black/40 backdrop-blur-sm">
              Click to {verified ? "view certificate" : "verify & decrypt"}
            </div>
          </div>
        </div>
        
        <CardContent className="p-4 space-y-3">
          {/* Product Info */}
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-xl font-bold gradient-text">{price}</p>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {verified ? (
              <Badge className="gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1.5">
                <Lock className="h-3 w-3" />
                Encrypted
              </Badge>
            )}
            
            {!isOnChain && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">
                Demo
              </Badge>
            )}
          </div>

          {/* Seller info */}
          {seller && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Seller: <span className="font-mono">{seller.slice(0, 6)}...{seller.slice(-4)}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ProductDetailDialog 
        product={{ id, name, price, image, verified, seller, certificate, isOnChain, onChainId }}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
};
