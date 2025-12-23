"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./wagmi";
import { Toaster } from "sonner";
import { ProductProvider } from "@/contexts/ProductContext";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ProductProvider>
          <Toaster position="top-right" richColors />
          {children}
        </ProductProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
