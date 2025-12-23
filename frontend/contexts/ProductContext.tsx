"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { toast } from "sonner";

export interface Product {
  id: string | number;
  name: string;
  price: string;
  image: string;
  certificate: string;
  seller?: string;
  verified: boolean;
  isOnChain?: boolean;
  onChainId?: number;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  verifyProduct: (productId: string | number) => void;
  removeProduct: (productId: string | number) => void;
  updateProduct: (productId: string | number, updates: Partial<Product>) => void;
  clearProducts: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}

interface ProductProviderProps {
  children: ReactNode;
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now(),
    };
    setProducts(prev => [...prev, newProduct]);
    toast.success("Product added successfully!");
  }, []);

  const verifyProduct = useCallback((productId: string | number) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, verified: true }
          : product
      )
    );
    toast.success("Product verified successfully!");
  }, []);

  const removeProduct = useCallback((productId: string | number) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
    toast.success("Product removed");
  }, []);

  const updateProduct = useCallback((productId: string | number, updates: Partial<Product>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, ...updates }
          : product
      )
    );
  }, []);

  const clearProducts = useCallback(() => {
    setProducts([]);
    toast.success("All products cleared");
  }, []);

  const value: ProductContextType = {
    products,
    addProduct,
    verifyProduct,
    removeProduct,
    updateProduct,
    clearProducts,
    isLoading,
    setIsLoading,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}
