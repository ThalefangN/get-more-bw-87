
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { Cart } from "@/components/Cart";

const CategoryProductsPage = () => {
  const { categoryName } = useParams<{ categoryName: string }>();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gray-50 py-12">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              {categoryName ? `${categoryName} Products` : "All Products"}
            </h1>
            <p className="text-gray-600 mb-8">
              Browse our selection of products in this category.
            </p>
          </div>
        </div>

        {/* We're passing categoryName as a category prop to ProductGrid */}
        <ProductGrid category={categoryName} />
      </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default CategoryProductsPage;
