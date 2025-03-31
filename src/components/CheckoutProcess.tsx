
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCheck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { Courier } from "@/types/courier";

interface CheckoutProcessProps {
  address: string;
  onSuccess: () => void;
}

const CheckoutProcess = ({ address, onSuccess }: CheckoutProcessProps) => {
  const [step, setStep] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [availableCouriers, setAvailableCouriers] = useState<Courier[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(null);
  const [selectedCourierName, setSelectedCourierName] = useState<string | null>(null);
  const { cartItems, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentStore: store, notifyCourier } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Generate order ID only once when the dialog opens
    if (isDialogOpen && !orderId) {
      setOrderId(uuidv4());
    }
  }, [isDialogOpen, orderId]);

  useEffect(() => {
    // Fetch available couriers when the component mounts
    const fetchAvailableCouriers = async () => {
      try {
        const { data, error } = await supabase
          .from('couriers')
          .select('*')
          .eq('status', 'active');

        if (error) {
          console.error("Error fetching available couriers:", error);
          toast({
            title: "Error",
            description: "Failed to fetch available couriers.",
            variant: "destructive",
          });
        }

        if (data) {
          // Type cast to match our Courier interface
          setAvailableCouriers(data as Courier[]);
        }
      } catch (error) {
        console.error("Unexpected error fetching couriers:", error);
        toast({
          title: "Unexpected Error",
          description: "An unexpected error occurred while fetching couriers.",
          variant: "destructive",
        });
      }
    };

    if (step === 1) {
      fetchAvailableCouriers();
    }
  }, [step, toast]);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      placeOrder();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleCourierSelect = async (courierId: string) => {
    setSelectedCourierId(courierId);
    
    // Find the courier details to display
    const selectedCourier = availableCouriers.find(c => c.id === courierId);
    if (selectedCourier) {
      setSelectedCourierName(selectedCourier.name);
    }
    
    // If this is part of order placement, notify the courier
    if (step === 2 && orderId) {
      // Create order details to send to the courier
      const orderDetails = {
        items: cartItems,
        storeId: store?.id || "",
        storeName: store?.name || "Store",
        deliveryAddress: address,
        customerName: user?.email || "Customer"
      };
      
      // Notify the courier using our new context function
      await notifyCourier(orderId, courierId, orderDetails);
      toast({
        title: "Courier notified",
        description: "The courier has been notified about this delivery request.",
      });
    }
  };

  const placeOrder = async () => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "Order ID is missing.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCourierId) {
      toast({
        title: "Error",
        description: "Please select a courier before placing the order.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare order items for Supabase
      const orderItems = cartItems.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            id: orderId,
            store_id: store?.id || "",
            customer_id: user?.uid || "", // Use uid instead of id
            customer_name: user?.email || "Guest",
            items: orderItems,
            total_amount: totalPrice,
            status: 'pending',
            address: address,
            courier_assigned: selectedCourierId
          }
        ]);

      if (error) {
        console.error("Error placing order:", error);
        toast({
          title: "Error",
          description: "Failed to place order.",
          variant: "destructive",
        });
        return;
      }

      // Clear the cart
      clearCart();

      // Show success message
      toast({
        title: "Order placed",
        description: "Your order has been placed successfully.",
      });

      // Close the dialog and trigger success callback
      setIsDialogOpen(false);
      onSuccess();

      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error("Unexpected error placing order:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while placing your order.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Checkout Process</DialogTitle>
        </DialogHeader>

        {step === 0 && (
          <div>
            <p>Confirm your delivery address:</p>
            <p className="font-bold">{address}</p>
          </div>
        )}

        {step === 1 && (
          <div>
            <p>Select a courier:</p>
            {availableCouriers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCouriers.map(courier => (
                  <Button
                    key={courier.id}
                    variant={selectedCourierId === courier.id ? "default" : "outline"}
                    onClick={() => handleCourierSelect(courier.id)}
                  >
                    {courier.name}
                  </Button>
                ))}
              </div>
            ) : (
              <p>No couriers available at the moment.</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <p>Confirm your order:</p>
            <p>Delivery Address: {address}</p>
            <p>Courier: {selectedCourierName || "Not selected"}</p>
            <p>Total: P{totalPrice.toFixed(2)}</p>
          </div>
        )}

        <div className="flex justify-between mt-4">
          {step > 0 && (
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={placeOrder}>Place Order</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutProcess;
