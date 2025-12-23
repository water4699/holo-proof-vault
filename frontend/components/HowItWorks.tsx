"use client";

import { Upload, Lock, Shield, Unlock, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Product",
    description: "Add your product with encrypted certificate data using FHE encryption",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    icon: Lock,
    title: "Encrypt On-Chain",
    description: "Certificate is encrypted and stored on blockchain with holographic seal",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    icon: Shield,
    title: "Verify Identity",
    description: "Sign with your wallet to prove ownership and request decryption",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
  {
    icon: Unlock,
    title: "Decrypt Certificate",
    description: "Access the original certificate data after successful verification",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="scroll-mt-20">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
          <span className="text-sm font-medium text-accent">Simple Process</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          How It Works
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          ProofVault uses Fully Homomorphic Encryption (FHE) to secure product certificates 
          while allowing verification without exposing sensitive data.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-12 left-full w-full z-0">
                <div className="flex items-center justify-center w-full px-4">
                  <ArrowRight className="w-6 h-6 text-border" />
                </div>
              </div>
            )}
            
            {/* Step Card */}
            <div className={`relative glass-card rounded-2xl p-6 border ${step.borderColor} h-full`}>
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
                <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
              </div>
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl ${step.bgColor} flex items-center justify-center mb-4`}>
                <step.icon className={`w-7 h-7 bg-gradient-to-br ${step.color} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text' }} />
                <step.icon className={`w-7 h-7 absolute`} style={{ 
                  background: `linear-gradient(135deg, ${step.color.includes('blue') ? '#3b82f6, #06b6d4' : step.color.includes('purple') ? '#a855f7, #ec4899' : step.color.includes('orange') ? '#f97316, #ef4444' : '#22c55e, #10b981'})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }} />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <div className="mt-12 p-6 rounded-2xl bg-card/50 border border-border/50">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">FHEVM</div>
            <div className="text-xs text-muted-foreground">Encryption</div>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block"></div>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">Hardhat</div>
            <div className="text-xs text-muted-foreground">Smart Contracts</div>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block"></div>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">Next.js</div>
            <div className="text-xs text-muted-foreground">Frontend</div>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block"></div>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">Wagmi</div>
            <div className="text-xs text-muted-foreground">Web3</div>
          </div>
        </div>
      </div>
    </section>
  );
};
