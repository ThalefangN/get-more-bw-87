
import { ShoppingBag, Coffee, Apple, Pizza, Gift, Beef, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    id: 1,
    name: "Groceries",
    icon: <ShoppingBag className="text-getmore-purple" size={32} />,
    items: "1000+ items"
  },
  {
    id: 2,
    name: "Beverages",
    icon: <Coffee className="text-getmore-purple" size={32} />,
    items: "500+ items"
  },
  {
    id: 3,
    name: "Fruits & Vegetables",
    icon: <Apple className="text-getmore-purple" size={32} />,
    items: "300+ items"
  },
  {
    id: 4,
    name: "Ready Meals",
    icon: <Pizza className="text-getmore-purple" size={32} />,
    items: "200+ items"
  },
  {
    id: 5,
    name: "Gifts & Lifestyle",
    icon: <Gift className="text-getmore-purple" size={32} />,
    items: "100+ items"
  },
  {
    id: 6,
    name: "Meat & Poultry",
    icon: <Beef className="text-getmore-purple" size={32} />,
    items: "150+ items"
  }
];

const Categories = () => {
  return (
    <section id="categories" className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold">Categories</h2>
            <p className="text-gray-600 mt-2">Browse products by category</p>
          </div>
          <Link to="/categories" className="flex items-center text-getmore-purple hover:underline">
            View All
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  {category.icon}
                </div>
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.items}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
