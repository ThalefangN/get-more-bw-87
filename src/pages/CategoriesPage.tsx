import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Categories from "@/components/Categories";
import { Cart } from "@/components/Cart";

const CategoriesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gray-50 py-12">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Categories</h1>
            <p className="text-gray-600 mb-8">Explore our wide range of categories to find exactly what you're looking for.</p>
          </div>
        </div>
        <Categories />
      </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default CategoriesPage;
