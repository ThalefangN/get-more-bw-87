
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ProductGrid from "@/components/ProductGrid";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { CartProvider } from "@/contexts/CartContext";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            <span className="text-getmore-purple">Get</span>
            <span className="text-getmore-turquoise">More</span>
            <span className="text-gray-700">BW</span>
          </div>
          <div className="mt-4 text-gray-600">Loading amazing products...</div>
          <div className="mt-6 w-12 h-12 rounded-full border-4 border-getmore-purple border-t-transparent animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <Categories />
          <ProductGrid />
          <HowItWorks />
        </main>
        <Footer />
        <Cart />
      </div>
    </CartProvider>
  );
};

export default Index;
