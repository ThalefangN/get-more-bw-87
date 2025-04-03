
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: number;
  name: string;
  count: number;
  image: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        // Get products from Supabase
        const { data, error } = await supabase
          .from('products')
          .select('category');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Count products by category
          const categoryCount: Record<string, number> = {};
          data.forEach(product => {
            const category = product.category;
            categoryCount[category] = (categoryCount[category] || 0) + 1;
          });
          
          // Create category objects
          const transformedCategories = Object.keys(categoryCount).map((name, index) => ({
            id: index + 1,
            name,
            count: categoryCount[name],
            image: getCategoryImage(name)
          }));
          
          setCategories(transformedCategories);
        } else {
          // Fallback to sample categories
          setCategories(getSampleCategories());
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to sample categories
        setCategories(getSampleCategories());
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    
    // Set up real-time subscription for product updates
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', {
        event: '*', // Listen for all events
        schema: 'public',
        table: 'products'
      }, (payload) => {
        console.log('Real-time product change:', payload);
        // Refresh categories when any change occurs
        fetchCategories();
      })
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getCategoryImage = (name: string): string => {
    // Map category names to images from the sample categories
    const categoryImageMap: Record<string, string> = {
      "Groceries": "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop",
      "Beverages": "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=1000&auto=format&fit=crop",
      "Fruits & Vegetables": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop",
      "Fruits": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop",
      "Vegetables": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop",
      "Ready Meals": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
      "Gifts & Lifestyle": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop",
      "Meat & Poultry": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1000&auto=format&fit=crop",
      "Meat": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1000&auto=format&fit=crop",
      "Bakery": "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=1000&auto=format&fit=crop",
      "Dairy": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=1000&auto=format&fit=crop",
      "Snacks": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=1000&auto=format&fit=crop",
      "Household": "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?q=80&w=1000&auto=format&fit=crop",
      "Personal Care": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1000&auto=format&fit=crop",
      "Baby Products": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1000&auto=format&fit=crop"
    };
    
    return categoryImageMap[name] || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop";
  };

  const getSampleCategories = (): Category[] => {
    return [
      {
        id: 1,
        name: "Groceries",
        count: 1000,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"
      },
      {
        id: 2,
        name: "Beverages",
        count: 500,
        image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=1000&auto=format&fit=crop"
      },
      {
        id: 3,
        name: "Fruits & Vegetables",
        count: 300,
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop"
      },
      {
        id: 4,
        name: "Ready Meals",
        count: 200,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop"
      },
      {
        id: 5,
        name: "Gifts & Lifestyle",
        count: 100,
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop"
      },
      {
        id: 6,
        name: "Meat & Poultry",
        count: 150,
        image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1000&auto=format&fit=crop"
      }
    ];
  };

  const handleCategoryClick = (category: Category) => {
    // Update to use the same URL pattern as the category carousel
    navigate(`/shop?category=${encodeURIComponent(category.name)}`);
  };

  return (
    <section className="py-10 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-40"></div>
                <div className="h-4 bg-gray-200 rounded mt-2 w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded mt-2 w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="h-40 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.count} items</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
