
import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { Product } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

// Sample product data
const products: Product[] = [
  {
    id: 1,
    name: "Fresh Milk 1L",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1pbGt8ZW58MHx8MHx8fDA%3D",
    category: "Dairy"
  },
  {
    id: 2,
    name: "Organic Bananas (6 pcs)",
    price: 12.50,
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJhbmFuYXN8ZW58MHx8MHx8fDA%3D",
    category: "Fruits"
  },
  {
    id: 3,
    name: "Chicken Breast (500g)",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hpY2tlbiUyMGJyZWFzdHxlbnwwfHwwfHx8MA%3D%3D",
    category: "Meat"
  },
  {
    id: 4,
    name: "Brown Bread Loaf",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YnJlYWR8ZW58MHx8MHx8fDA%3D",
    category: "Bakery"
  },
  {
    id: 5,
    name: "Coca-Cola (2L)",
    price: 18.50,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNvY2ElMjBjb2xhfGVufDB8fDB8fHww",
    category: "Beverages"
  },
  {
    id: 6,
    name: "Fresh Avocados (2 pcs)",
    price: 25.99,
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZvY2Fkb3xlbnwwfHwwfHx8MA%3D%3D",
    category: "Fruits"
  },
  {
    id: 7,
    name: "Local Honey (500g)",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG9uZXl8ZW58MHx8MHx8fDA%3D",
    category: "Groceries"
  },
  {
    id: 8,
    name: "Free Range Eggs (12 pcs)",
    price: 28.99,
    image: "https://images.unsplash.com/photo-1551292831-023188e78222?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZWdnc3xlbnwwfHwwfHx8MA%3D%3D",
    category: "Dairy"
  }
];

const ProductGrid = () => {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <p className="text-gray-600 mt-2">Top picks for you</p>
          </div>
          <Link to="/shop" className="flex items-center text-getmore-purple hover:underline">
            View All
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
