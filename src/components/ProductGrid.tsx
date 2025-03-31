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
}

const ProductGrid = ({ showAllProducts = false, storeId }: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch products from Supabase
        let query = supabase
          .from('products')
          .select('*')
          .eq('in_stock', true)
          .order('created_at', { ascending: false });
        
        // If a specific store is requested, filter products by store
        if (storeId) {
          query = query.eq('store_id', storeId);
        }
        
        // Limit products only if not showing all
        if (!showAllProducts) {
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
            storeId: product.store_id // Make sure store_id is included
          }));
          
          setProducts(transformedProducts);
        } else {
          // If no data is returned, use sample data
          setProducts(getSampleProducts());
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error("Failed to load products", {
          description: "Using sample products instead"
        });
        // Fallback to sample data if fetch fails
        setProducts(getSampleProducts());
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
  }, [showAllProducts, storeId]);

  const getSampleProducts = (): Product[] => {
    return [
      {
        id: "1",
        name: "Fresh Milk 1L",
        price: 15.99,
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1pbGt8ZW58MHx8MHx8fDA%3D",
        category: "Dairy",
        quantity: 1
      },
      {
        id: "2",
        name: "Organic Bananas (6 pcs)",
        price: 12.50,
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJhbmFuYXN8ZW58MHx8MHx8fDA%3D",
        category: "Fruits",
        quantity: 1
      },
      {
        id: "3",
        name: "Chicken Breast (500g)",
        price: 34.99,
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hpY2tlbiUyMGJyZWFzdHxlbnwwfHwwfHx8MA%3D%3D",
        category: "Meat",
        quantity: 1
      },
      {
        id: "4",
        name: "Brown Bread Loaf",
        price: 9.99,
        image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YnJlYWR8ZW58MHx8MHx8fDA%3D",
        category: "Bakery",
        quantity: 1
      },
      {
        id: "5",
        name: "Coca-Cola (2L)",
        price: 18.50,
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNvY2ElMjBjb2xhfGVufDB8fDB8fHww",
        category: "Beverages",
        quantity: 1
      },
      {
        id: "6",
        name: "Fresh Avocados (2 pcs)",
        price: 25.99,
        image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZvY2Fkb3xlbnwwfHwwfHx8MA%3D%3D",
        category: "Fruits",
        quantity: 1
      },
      {
        id: "7",
        name: "Local Honey (500g)",
        price: 45.00,
        image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG9uZXl8ZW58MHx8MHx8fDA%3D",
        category: "Groceries",
        quantity: 1
      },
      {
        id: "8",
        name: "Free Range Eggs (12 pcs)",
        price: 28.99,
        image: "https://images.unsplash.com/photo-1551292831-023188e78222?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZWdnc3xlbnwwfHwwfHx8MA%3D%3D",
        category: "Dairy",
        quantity: 1
      }
    ];
  };

  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold">
              {showAllProducts ? "All Products" : "Featured Products"}
            </h2>
            <p className="text-gray-600 mt-2">
              {showAllProducts ? "Browse our complete selection" : "Top picks for you"}
            </p>
          </div>
          {!showAllProducts && (
            <Link to="/all-products" className="flex items-center text-getmore-purple hover:underline">
              View All
              <ChevronRight size={16} className="ml-1" />
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400">Check back later for new products</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
