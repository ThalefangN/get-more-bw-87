import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: number;
  name: string;
  items: string;
  image: string;
}

const CategoryCarousel = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Use the same categories as in CategoriesPage
    const fetchCategories = async () => {
      setLoading(true);
      try {
        // Attempt to fetch categories from products table
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('category');
        
        if (productsError) throw productsError;
        
        if (productsData && productsData.length > 0) {
          // Get unique categories and count
          const categoryCount: Record<string, number> = {};
          productsData.forEach(product => {
            const category = product.category;
            categoryCount[category] = (categoryCount[category] || 0) + 1;
          });
          
          // Use allCategories images and format
          const formattedCategories = Object.keys(categoryCount).map((name, index) => ({
            id: index + 1,
            name,
            items: `${categoryCount[name]}+ items`,
            image: getCategoryImage(name)
          }));
          
          setCategories(formattedCategories);
        } else {
          // Fallback to sample categories
          setCategories(getSampleCategories());
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(getSampleCategories());
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
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
        items: "1000+ items",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"
      },
      {
        id: 2,
        name: "Beverages",
        items: "500+ items",
        image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=1000&auto=format&fit=crop"
      },
      {
        id: 3,
        name: "Fruits & Vegetables",
        items: "300+ items",
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop"
      },
      {
        id: 4,
        name: "Ready Meals",
        items: "200+ items",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop"
      },
      {
        id: 5,
        name: "Gifts & Lifestyle",
        items: "100+ items",
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop"
      },
      {
        id: 6,
        name: "Meat & Poultry",
        items: "150+ items",
        image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1000&auto=format&fit=crop"
      }
    ];
  };

  const handleCategoryClick = (category: Category) => {
    const formattedCategoryName = encodeURIComponent(category.name.toLowerCase());
    navigate(`/categories/${formattedCategoryName}`);
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="container-custom">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-10 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {categories.map((category) => (
              <CarouselItem key={category.id} className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <div 
                  className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="h-32 overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.items}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-1 bg-white" />
          <CarouselNext className="right-1 bg-white" />
        </Carousel>
      </div>
    </section>
  );
};

export default CategoryCarousel;
