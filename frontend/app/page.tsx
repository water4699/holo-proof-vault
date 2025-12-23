import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { HowItWorks } from "@/components/HowItWorks";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <main className="container mx-auto px-4 py-12 space-y-20">
        <ProductGrid />
        <HowItWorks />
      </main>
    </div>
  );
}
