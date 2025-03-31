
import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import CheckoutProcess from "./CheckoutProcess";
import { Button } from "./ui/button";
import { ShoppingCart, Trash2, ShoppingBag } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const { toast } = useToast();

  const handleCheckout = () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter a delivery address to continue.",
        variant: "destructive",
      });
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setIsCartOpen(false);
    setDeliveryAddress("");
    clearCart();
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  if (!isCartOpen) return null;

  return (
    <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5 text-emerald-600" />
            Your Cart
          </DialogTitle>
        </DialogHeader>
        
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-1 pr-4 max-h-[50vh]">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">P{item.price.toFixed(2)}</p>
                      <div className="flex items-center mt-1">
                        <button 
                          className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button 
                          className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">P{(item.price * item.quantity).toFixed(2)}</p>
                      <button 
                        className="text-red-500 mt-1 p-1 rounded-full hover:bg-red-50 transition-colors"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="mt-4 space-y-4">
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-medium">Total</span>
                <span className="font-bold text-emerald-700">P{totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center text-gray-700">
                  <ShoppingBag className="h-4 w-4 mr-2 text-emerald-600" />
                  Delivery Address
                </Label>
                <Input 
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your delivery address"
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => clearCart()}
                >
                  Clear Cart
                </Button>
                <Button 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <ShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">Your cart is empty</h3>
            <p className="text-gray-500 text-center mt-1 max-w-xs">
              Add items to your cart to get started with your shopping experience.
            </p>
            <Button 
              variant="outline" 
              className="mt-4 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              onClick={() => setIsCartOpen(false)}
            >
              Continue Shopping
            </Button>
          </div>
        )}
        
        {showCheckout && (
          <CheckoutProcess
            address={deliveryAddress}
            onSuccess={handleCheckoutSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
