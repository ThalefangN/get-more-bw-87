
import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import CheckoutProcess from "./CheckoutProcess";
import { Button } from "./ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

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
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed right-0 top-0 z-40 h-screen w-[320px] bg-white shadow-lg border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          <h2 className="font-semibold">Your Cart</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={() => setIsCartOpen(false)}
        >
          &times;
        </Button>
      </div>
      
      {cartItems.length > 0 ? (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-md overflow-hidden">
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
                        className="w-6 h-6 rounded-full border flex items-center justify-center"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button 
                        className="w-6 h-6 rounded-full border flex items-center justify-center"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">P{(item.price * item.quantity).toFixed(2)}</p>
                    <button 
                      className="text-red-500 mt-1"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 space-y-4 border-t border-gray-200">
            <Separator />
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold">P{totalPrice.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Input 
                id="address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => clearCart()}
              >
                Clear Cart
              </Button>
              <Button 
                className="flex-1"
                onClick={handleCheckout}
              >
                Checkout
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 p-4">
          <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium">Your cart is empty</h3>
          <p className="text-gray-500 text-center mt-1">
            Add items to your cart to get started.
          </p>
        </div>
      )}
      
      {showCheckout && (
        <CheckoutProcess
          address={deliveryAddress}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
}
