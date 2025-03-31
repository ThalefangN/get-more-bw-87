
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const CategoryProductsPage = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const decodedCategoryName = categoryName ? decodeURIComponent(categoryName) : "";
  const formattedCategoryName = decodedCategoryName.replace(/-/g, " ");
  const displayCategoryName = formattedCategoryName.charAt(0).toUpperCase() + formattedCategoryName.slice(1);
  
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        // Fetch products from the specified category
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('in_stock', true)
          .ilike('category', formattedCategoryName)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const transformedProducts: Product[] = data.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            images: product.images || [product.image],
            category: product.category,
            description: product.description || '',
            quantity: 1
          }));
          
          setProducts(transformedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching category products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (formattedCategoryName) {
      fetchCategoryProducts();
    }
  }, [formattedCategoryName]);

  // Filter products by search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="bg-gray-50 py-12">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">{displayCategoryName}</h1>
            <p className="text-gray-600 mb-8">Browse all products in the {displayCategoryName.toLowerCase()} category</p>
            
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
        
        <section className="py-16">
          <div className="container-custom">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg aspect-square mb-4"></div>
                    <div className="bg-gray-200 h-4 w-20 rounded mb-2"></div>
                    <div className="bg-gray-200 h-6 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 w-24 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No products found in this category</p>
                    <p className="text-gray-400">Try searching for something else or check back later</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default CategoryProductsPage;
