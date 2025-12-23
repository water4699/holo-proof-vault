"use client";

import { Shield, Lock, CheckCircle, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute top-20 left-10 w-20 h-20 holographic-seal rounded-2xl opacity-20 floating blur-sm"></div>
      <div className="absolute top-40 right-20 w-16 h-16 holographic-seal rounded-full opacity-15 floating" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-12 h-12 holographic-seal rounded-lg opacity-20 floating" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-40 right-1/3 w-24 h-24 holographic-seal rounded-3xl opacity-10 floating" style={{ animationDelay: '0.5s' }}></div>
      
      <div className="container mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Powered by Fully Homomorphic Encryption</span>
        </div>

        {/* Main heading */}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="text-foreground">Authenticity,</span>
          <br />
          <span className="gradient-text glow-text">Unlocked by You</span>
        </h2>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Verify product authenticity through blockchain signatures. 
          Decrypt certificates with your wallet and unlock the truth behind every product.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-12">
          <div className="glass-card rounded-2xl p-4 md:p-6">
            <div className="text-2xl md:text-4xl font-bold gradient-text mb-1">100%</div>
            <div className="text-xs md:text-sm text-muted-foreground">Encrypted</div>
          </div>
          <div className="glass-card rounded-2xl p-4 md:p-6">
            <div className="text-2xl md:text-4xl font-bold gradient-text mb-1">On-Chain</div>
            <div className="text-xs md:text-sm text-muted-foreground">Verification</div>
          </div>
          <div className="glass-card rounded-2xl p-4 md:p-6">
            <div className="text-2xl md:text-4xl font-bold gradient-text mb-1">FHE</div>
            <div className="text-xs md:text-sm text-muted-foreground">Protected</div>
          </div>
        </div>
        
        {/* Features */}
        <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-card/50 border border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Encrypted Certificates</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-card/50 border border-border/50">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">On-Chain Verification</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-card/50 border border-border/50">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Holographic Seals</span>
          </div>
        </div>
      </div>
    </section>
  );
};
