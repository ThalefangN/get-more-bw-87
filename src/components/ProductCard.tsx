
import { Plus } from "lucide-react";
import { useCart, Product } from "@/contexts/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  
  return (
    <div className="product-card">
      <div className="relative overflow-hidden rounded-lg mb-4 aspect-square">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-md">
          <button 
            onClick={() => addToCart(product)}
            className="bg-getmore-purple text-white p-1.5 rounded-full hover:bg-opacity-90"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        <span className="text-xs text-getmore-purple bg-getmore-purple/10 px-2 py-1 rounded-full">
          {product.category}
        </span>
        <h3 className="font-medium mt-2 line-clamp-2">{product.name}</h3>
        <div className="mt-1 mb-3 text-sm text-gray-500">
          {/* Product details would go here */}
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-auto">
        <span className="font-bold">P{product.price.toFixed(2)}</span>
        <button 
          onClick={() => addToCart(product)}
          className="text-sm bg-getmore-purple text-white px-3 py-1.5 rounded-lg hover:bg-opacity-90"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
