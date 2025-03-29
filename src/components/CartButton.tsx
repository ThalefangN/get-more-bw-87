
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const CartButton = () => {
  const { totalItems, setIsCartOpen } = useCart();
  
  return (
    <button 
      onClick={() => setIsCartOpen(true)}
      className="relative text-gray-700 hover:text-getmore-purple"
    >
      <ShoppingCart size={24} />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-getmore-purple text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {totalItems}
        </span>
      )}
    </button>
  );
};

export default CartButton;
