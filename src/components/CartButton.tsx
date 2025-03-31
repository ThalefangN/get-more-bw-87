
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CartButton = () => {
  const { totalItems, setIsCartOpen, isCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleCartClick = () => {
    if (!isAuthenticated) {
      // If not authenticated, prompt to sign in
      toast("Please sign in", {
        description: "You need to be signed in to view your cart",
        action: {
          label: "Sign in",
          onClick: () => navigate("/sign-in")
        },
      });
      return;
    }
    
    // If authenticated, toggle the cart
    setIsCartOpen(!isCartOpen);
  };
  
  return (
    <button 
      onClick={handleCartClick}
      className="relative text-gray-700 hover:text-getmore-purple"
    >
      <ShoppingCart size={24} />
      {totalItems > 0 && isAuthenticated && (
        <span className="absolute -top-2 -right-2 bg-getmore-purple text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {totalItems}
        </span>
      )}
    </button>
  );
};

export default CartButton;
