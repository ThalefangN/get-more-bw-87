
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { Grid, Tag, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const allCategories = [
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
  },
  {
    id: 7,
    name: "Bakery",
    items: "120+ items",
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 8,
    name: "Dairy",
    items: "80+ items",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 9,
    name: "Snacks",
    items: "250+ items",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 10,
    name: "Household",
    items: "180+ items",
    image: "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 11,
    name: "Personal Care",
    items: "150+ items",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 12,
    name: "Baby Products",
    items: "90+ items",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1000&auto=format&fit=crop"
  }
];

const CategoriesPage = () => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCategories = allCategories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to format category name for URL
  const formatCategoryUrl = (name: string): string => {
    return encodeURIComponent(name.toLowerCase());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gray-50 py-12">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">All Categories</h1>
            <p className="text-gray-600 mb-8">Browse all product categories and find exactly what you need.</p>
          </div>
        </div>
        
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
            <div className="relative max-w-md w-full">
              <input 
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-getmore-purple"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setLayout("grid")}
                className={`p-2 rounded-md ${layout === "grid" ? "bg-getmore-purple text-white" : "bg-gray-200 text-gray-700"}`}
              >
                <Grid size={20} />
              </button>
              <button 
                onClick={() => setLayout("list")}
                className={`p-2 rounded-md ${layout === "list" ? "bg-getmore-purple text-white" : "bg-gray-200 text-gray-700"}`}
              >
                <Tag size={20} />
              </button>
            </div>
          </div>
          
          {layout === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <Link 
                  key={category.id} 
                  to={`/categories/${formatCategoryUrl(category.name)}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.items}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <Link 
                  key={category.id}
                  to={`/categories/${formatCategoryUrl(category.name)}`}
                  className="bg-white rounded-lg shadow p-4 flex items-center hover:shadow-md transition-shadow"
                >
                  <div className="w-20 h-20 overflow-hidden rounded-lg mr-4">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.items}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No categories found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default CategoriesPage;
