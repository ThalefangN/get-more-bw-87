
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryCarousel from "@/components/CategoryCarousel";
import ProductGrid from "@/components/ProductGrid";
import { Cart } from "@/components/Cart";

const Shop = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="bg-gray-50 py-12">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Shop</h1>
            <p className="text-gray-600 mb-8">Explore our wide range of products from various categories.</p>
          </div>
        </div>
        
        <CategoryCarousel />
        <ProductGrid category={undefined} />
      </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default Shop;
