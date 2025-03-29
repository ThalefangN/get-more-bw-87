
import { useState } from "react";
import { Plus, Check, ShoppingBag } from "lucide-react";
import { useCart, Product } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);
  
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast("Please sign in to add items to your cart", {
        description: "You need to be signed in to continue shopping",
        action: {
          label: "Sign in",
          onClick: () => navigate("/sign-in")
        },
      });
      return;
    }
    
    addToCart(product);
    setIsAdded(true);
    
    toast.success("Added to cart", {
      description: `${product.name} has been added to your cart`,
    });
    
    // Reset the added state after a short delay
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };
  
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
            onClick={handleAddToCart}
            className={`${isAdded ? 'bg-green-500' : 'bg-getmore-purple'} text-white p-1.5 rounded-full hover:bg-opacity-90 transition-colors`}
          >
            {isAdded ? <Check size={16} /> : <Plus size={16} />}
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
          onClick={handleAddToCart}
          className={`text-sm flex items-center gap-1 ${isAdded ? 'bg-green-500' : 'bg-getmore-purple'} text-white px-3 py-1.5 rounded-lg hover:bg-opacity-90 transition-colors`}
        >
          {isAdded ? (
            <>
              <Check size={14} />
              Added
            </>
          ) : (
            <>
              <ShoppingBag size={14} />
              Add
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
