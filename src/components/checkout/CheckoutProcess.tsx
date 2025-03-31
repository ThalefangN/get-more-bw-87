
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { Courier } from "@/types/courier";

import CourierSelection from "./CourierSelection";
import PaymentMethodSelection from "./PaymentMethodSelection";
import OrderSummary from "./OrderSummary";
import OrderSuccess from "./OrderSuccess";
import StepIndicator from "./StepIndicator";

interface CheckoutProcessProps {
  address: string;
  onSuccess: () => void;
}

const CheckoutProcess = ({ address, onSuccess }: CheckoutProcessProps) => {
  const [step, setStep] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [availableCouriers, setAvailableCouriers] = useState<Courier[]>([]);
  
  const { cartItems, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentStore: store } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDialogOpen && !orderId) {
      setOrderId(uuidv4());
    }
  }, [isDialogOpen, orderId]);
  
  useEffect(() => {
    // Fetch available couriers for use in step review
    const fetchAvailableCouriers = async () => {
      try {
        const { data } = await supabase
          .from('couriers')
          .select('*')
          .eq('status', 'active');
        
        if (data) {
          setAvailableCouriers(data as Courier[]);
        }
      } catch (error) {
        console.error("Error fetching couriers for review:", error);
      }
    };
    
    fetchAvailableCouriers();
  }, []);

  const handleCourierSelect = (courierId: string) => {
    setSelectedCourierId(courierId);
  };

  const handleNext = () => {
    if (step === 0 && !selectedCourierId) {
      toast({
        title: "Courier Required",
        description: "Please select a courier to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 1 && !paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return;
    }
    
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

    setIsProcessing(true);
    
    try {
      const selectedCourier = availableCouriers.find(c => c.id === selectedCourierId);
      if (!selectedCourier) {
        throw new Error("Selected courier not found");
      }
      
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
            customer_id: user?.id || "",
            customer_name: user?.email || "Guest",
            items: orderItems,
            total_amount: totalPrice,
            address: address,
            status: 'pending',
            courier_assigned: selectedCourier.email
          }
        ]);

      if (error) {
        console.error("Error placing order:", error);
        toast({
          title: "Error",
          description: "Failed to place order.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Notify the courier about the new order
      if (user?.id) {
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: selectedCourier.id,
              title: 'New Order Assigned',
              message: `You have been assigned a new order to deliver to ${address}`,
              type: 'delivery_update',
              order_id: orderId,
              data: {
                storeId: store?.id || "",
                storeName: store?.name || "Store",
                customerAddress: address,
                customerName: user.email || "Customer",
                items: cartItems.length,
                total: totalPrice
              }
            });
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
      }

      clearCart();
      setIsProcessing(false);
      setIsOrderComplete(true);

      setTimeout(() => {
        setIsDialogOpen(false);
        onSuccess();
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error("Unexpected error placing order:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while placing your order.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <CourierSelection 
            address={address}
            selectedCourierId={selectedCourierId}
            onCourierSelect={handleCourierSelect}
          />
        );
      case 1:
        return (
          <PaymentMethodSelection
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />
        );
      case 2:
        const selectedCourier = availableCouriers.find(c => c.id === selectedCourierId);
        return (
          <OrderSummary
            address={address}
            selectedCourier={selectedCourier}
            paymentMethod={paymentMethod}
            totalPrice={totalPrice}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        {isOrderComplete ? (
          <OrderSuccess orderId={orderId} />
        ) : (
          <>
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-center text-xl flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-emerald-600" />
                Checkout Process
              </DialogTitle>
            </DialogHeader>
            
            <StepIndicator currentStep={step} totalSteps={3} />
            
            {renderStepContent()}
            
            <div className="flex justify-between mt-6 border-t pt-4">
              {step > 0 ? (
                <Button 
                  variant="outline" 
                  onClick={handleBack} 
                  disabled={isProcessing}
                  className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              <Button 
                onClick={handleNext} 
                disabled={isProcessing || (step === 0 && !selectedCourierId) || (step === 1 && !paymentMethod)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : step < 2 ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Place Order
                    <ShoppingBag className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutProcess;
