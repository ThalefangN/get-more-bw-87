
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CategoryCarousel from "@/components/CategoryCarousel";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Shop = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated - only redirect if not authenticated
    if (!isAuthenticated) {
      toast.error("Please sign in to browse products", {
        description: "You need to be logged in to shop",
      });
      navigate("/sign-in");
      return;
    }

    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Don't render anything if redirecting to sign-in
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            <span className="text-getmore-purple">Get</span>
            <span className="text-getmore-turquoise">More</span>
            <span className="text-gray-700">BW</span>
          </div>
          <div className="mt-4 text-gray-600">Loading products...</div>
          <div className="mt-6 w-12 h-12 rounded-full border-4 border-getmore-purple border-t-transparent animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gray-50 py-12">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Shop All Products</h1>
            <p className="text-gray-600 mb-8">Browse our full catalog of products and get what you need delivered in minutes.</p>
          </div>
        </div>
        <CategoryCarousel />
        <ProductGrid showAllProducts={false} />
      </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default Shop;
