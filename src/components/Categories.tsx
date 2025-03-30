
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  name: string;
  icon: string;
  count: number;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
          const transformedCategories = Object.keys(categoryCount).map(name => ({
            name,
            icon: getCategoryIcon(name),
            count: categoryCount[name]
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
  }, []);

  const getCategoryIcon = (category: string): string => {
    // Add icons based on category name
    const categoryIcons: Record<string, string> = {
      "Fruits": "🍎",
      "Vegetables": "🥦",
      "Dairy": "🥛",
      "Meat": "🥩",
      "Bakery": "🍞",
      "Beverages": "🥤",
      "Groceries": "🛒",
      "Snacks": "🍿",
      "Frozen": "❄️",
      "Household": "🧹",
      "Personal Care": "🧼",
      "Baby": "👶",
      "Pet": "🐾",
      "Electronics": "📱",
      "Other": "📦"
    };
    
    return categoryIcons[category] || "📦";
  };

  const getSampleCategories = (): Category[] => {
    return [
      { name: "Fruits", icon: "🍎", count: 12 },
      { name: "Vegetables", icon: "🥦", count: 15 },
      { name: "Dairy", icon: "🥛", count: 8 },
      { name: "Meat", icon: "🥩", count: 10 },
      { name: "Bakery", icon: "🍞", count: 6 },
      { name: "Beverages", icon: "🥤", count: 9 }
    ];
  };

  return (
    <section className="py-10 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white p-4 rounded-lg shadow-sm text-center h-28 flex flex-col items-center justify-center">
                  <div className="bg-gray-200 h-10 w-10 rounded-full mb-3"></div>
                  <div className="bg-gray-200 h-4 w-20 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 w-12 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link 
                key={index} 
                to={`/categories/${category.name.toLowerCase()}`}
                className="block"
              >
                <div className="bg-white p-4 rounded-lg shadow-sm text-center h-28 flex flex-col items-center justify-center hover:shadow transition-shadow">
                  <span className="text-3xl mb-2">{category.icon}</span>
                  <h3 className="font-medium mb-1">{category.name}</h3>
                  <span className="text-xs text-gray-500">{category.count} items</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
