
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryCarousel from "@/components/CategoryCarousel";
import ProductGrid from "@/components/ProductGrid";
import { Cart } from "@/components/Cart";

const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="bg-gray-50 py-12">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              {categoryParam ? `Shop ${categoryParam}` : "Shop"}
            </h1>
            <p className="text-gray-600 mb-8">
              {categoryParam 
                ? `Browse our selection of ${categoryParam} products` 
                : "Explore our wide range of products from various categories."}
            </p>
          </div>
        </div>
        
        <CategoryCarousel />
        <ProductGrid category={categoryParam || undefined} />
      </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default Shop;
