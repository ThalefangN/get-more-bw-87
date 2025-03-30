
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import ProductGrid from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

const AllProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gray-50 py-12">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">All Products</h1>
            <p className="text-gray-600 mb-8">Browse our full catalog of products and get what you need delivered in minutes.</p>
            
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-getmore-purple"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal size={16} />
                <span>Filter</span>
              </Button>
            </div>
          </div>
        </div>
        
        <ProductGrid showAllProducts={true} />
      </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default AllProducts;
