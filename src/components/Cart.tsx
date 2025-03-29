
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CheckoutProcess from "./CheckoutProcess";

const Cart = () => {
  const { 
    cartItems, 
    totalPrice, 
    updateQuantity, 
    removeFromCart, 
    isCartOpen, 
    setIsCartOpen,
    clearCart
  } = useCart();

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setCheckoutOpen(true);
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)}></div>
        
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-lg flex flex-col h-full animate-fade-in">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center">
              <ShoppingCart size={20} className="mr-2" />
              Your Cart
            </h2>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingCart size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">Your cart is empty</p>
                <p className="text-sm text-gray-400">Add items to get started</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex border-b pb-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    
                    <div className="ml-4 flex flex-1 flex-col">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.name}</h3>
                        <p className="ml-4">P{item.price.toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                      
                      <div className="flex items-center justify-between text-sm mt-auto">
                        <div className="flex items-center border rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-2">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-getmore-purple hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>P{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex flex-col space-y-2">
                <button 
                  className="btn-primary"
                  onClick={handleCheckout}
                >
                  Checkout
                </button>
                <button 
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700 text-center"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <CheckoutProcess onClose={() => setCheckoutOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cart;
