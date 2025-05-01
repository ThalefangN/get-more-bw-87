
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { Product } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductGridProps {
  showAllProducts?: boolean;
  storeId?: string;
  category?: string;
  isDashboard?: boolean;
}

const ProductGrid = ({ showAllProducts = false, storeId, category, isDashboard = false }: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch products from Supabase
        let query = supabase
          .from('products')
          .select('*');
        
        // If it's not the dashboard, only show in_stock products
        if (!isDashboard) {
          query = query.eq('in_stock', true);
        }
        
        // Sort by newest first
        query = query.order('created_at', { ascending: false });
        
        // If a specific store is requested, filter products by store
        if (storeId) {
          query = query.eq('store_id', storeId);
        }
        
        // If a specific category is requested, filter products by category
        if (category) {
          query = query.eq('category', category);
        }
        
        // Limit products only if not showing all
        if (!showAllProducts && !isDashboard) {
          query = query.limit(8); // Limit to 8 products for the featured section
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching products:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          // Transform the data to match our Product interface
          const transformedProducts: Product[] = data.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            images: product.images || [product.image],
            category: product.category,
            description: product.description || '',
            quantity: 1,
            storeId: product.store_id,
            inStock: product.in_stock
          }));
          
          setProducts(transformedProducts);
        } else {
          // If no data is returned or empty result
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Set up real-time subscription for product updates
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'products'
      }, (payload) => {
        console.log('Real-time product change:', payload);
        // Refresh products when any change occurs
        fetchProducts();
      })
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [showAllProducts, storeId, category, isDashboard]);

  // Title logic based on context
  const getTitle = () => {
    if (isDashboard) return "Your Products";
    if (category) return category;
    if (showAllProducts) return "All Products";
    return "Featured Products";
  };

  // Subtitle logic based on context
  const getSubtitle = () => {
    if (isDashboard) return "Manage your product catalog";
    if (category) return `Browse our selection of ${category} products`;
    if (showAllProducts) return "Browse our complete selection";
    return "Top picks for you";
  };

  return (
    <section className={isDashboard ? "py-4" : "py-16"}>
      <div className="container-custom">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold">{getTitle()}</h2>
            <p className="text-gray-600 mt-2">{getSubtitle()}</p>
          </div>
          {!showAllProducts && !category && !storeId && !isDashboard && (
            <Link to="/all-products" className="flex items-center text-getmore-purple hover:underline">
              View All
              <ChevronRight size={16} className="ml-1" />
            </Link>
          )}
          {isDashboard && (
            <Link to="/store-dashboard/products/new" className="flex items-center bg-getmore-purple text-white px-4 py-2 rounded-lg hover:bg-getmore-purple/90">
              Add Product
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(showAllProducts ? 12 : 8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg aspect-square mb-4"></div>
                <div className="bg-gray-200 h-4 w-20 rounded mb-2"></div>
                <div className="bg-gray-200 h-6 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 w-24 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isDashboard={isDashboard} />
            ))}
          </div>
        )}
        
        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {isDashboard 
                ? "You haven't added any products yet"
                : storeId 
                  ? "This store doesn't have any products yet"
                  : category
                    ? `No products found in ${category}`
                    : "No products found"}
            </p>
            {isDashboard ? (
              <Link to="/store-dashboard/products/new" className="mt-4 inline-flex items-center bg-getmore-purple text-white px-4 py-2 rounded-lg hover:bg-getmore-purple/90">
                Add Your First Product
              </Link>
            ) : (
              <p className="text-gray-400">Check back later for new products</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
