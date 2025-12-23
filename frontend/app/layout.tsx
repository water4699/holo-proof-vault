import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ProofVault - Blockchain Product Authentication",
  description: "Verify product authenticity through blockchain signatures with encrypted certificates powered by FHE",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background">
        {/* Background decorations */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
          
          {/* Gradient orbs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-gradient-to-tl from-accent/15 via-primary/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-primary/5 to-transparent rounded-full"></div>
        </div>
        
        <Providers>
          <div className="relative z-0">
            {children}
          </div>
          
          {/* Footer */}
          <footer className="relative z-10 border-t border-border/50 bg-card/30 backdrop-blur-sm mt-20">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 holographic-seal rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-white">P</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ProofVault © 2024 - Powered by FHEVM
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 status-dot"></div>
                    Network: Hardhat Local
                  </span>
                  <span>Built with Zama FHE</span>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
