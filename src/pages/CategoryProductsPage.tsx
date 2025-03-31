
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { Cart } from "@/components/Cart";

const CategoryProductsPage = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const decodedCategoryName = categoryName ? decodeURIComponent(categoryName) : "";
  
  // Format the category name for display (capitalize first letter)
  const formatDisplayName = (name: string): string => {
    if (!name) return "";
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="bg-gray-50 py-12">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              {decodedCategoryName ? formatDisplayName(decodedCategoryName) : "All Products"}
            </h1>
            <p className="text-gray-600 mb-8">
              Browse our selection of products in this category.
            </p>
          </div>
        </div>

        <ProductGrid category={decodedCategoryName} />
      </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default CategoryProductsPage;
