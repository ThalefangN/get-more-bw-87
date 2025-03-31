
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCheck, CreditCard, Smartphone, ArrowRight, ArrowLeft, Truck, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { Courier } from "@/types/courier";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface CheckoutProcessProps {
  address: string;
  onSuccess: () => void;
}

const paymentMethods = [
  { id: "bank", name: "Bank Transfer", icon: CreditCard },
  { id: "myzaka", name: "MyZaka", icon: Smartphone },
  { id: "smega", name: "Smega", icon: Smartphone },
  { id: "orange", name: "Orange Money", icon: Smartphone },
];

const CheckoutProcess = ({ address, onSuccess }: CheckoutProcessProps) => {
  const [step, setStep] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [availableCouriers, setAvailableCouriers] = useState<Courier[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(null);
  const [selectedCourierName, setSelectedCourierName] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  
  const { cartItems, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentStore: store, notifyCourier } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDialogOpen && !orderId) {
      setOrderId(uuidv4());
    }
  }, [isDialogOpen, orderId]);

  useEffect(() => {
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

  const handleCourierSelect = async (courierId: string) => {
    setSelectedCourierId(courierId);
    
    const selectedCourier = availableCouriers.find(c => c.id === courierId);
    if (selectedCourier) {
      setSelectedCourierName(selectedCourier.name);
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
            customer_id: user?.email || "",
            customer_name: user?.email || "Guest",
            items: orderItems,
            total_amount: totalPrice,
            address: address,
            status: 'pending',
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
        setIsProcessing(false);
        return;
      }

      if (orderId && selectedCourierId) {
        const orderDetails = {
          items: cartItems,
          storeId: store?.id || "",
          storeName: store?.name || "Store",
          deliveryAddress: address,
          customerName: user?.email || "Customer"
        };
        
        await notifyCourier(orderId, selectedCourierId, orderDetails);
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
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium">Delivery Address:</p>
              <p className="text-gray-700">{address}</p>
            </div>
            
            <h3 className="text-lg font-medium">Select a courier:</h3>
            {availableCouriers.length > 0 ? (
              <RadioGroup value={selectedCourierId || ""} onValueChange={handleCourierSelect} className="grid grid-cols-1 gap-3">
                {availableCouriers.map(courier => (
                  <div 
                    key={courier.id}
                    className={`border p-4 rounded-lg flex items-center cursor-pointer ${
                      selectedCourierId === courier.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                  >
                    <RadioGroupItem value={courier.id} id={courier.id} className="mr-4" />
                    <div className="flex-1">
                      <label htmlFor={courier.id} className="font-medium cursor-pointer block">
                        {courier.name}
                      </label>
                      <p className="text-sm text-gray-500">Vehicle: {courier.vehicle_type}</p>
                    </div>
                    <Truck className="text-gray-400 h-5 w-5" />
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="bg-amber-50 text-amber-600 p-4 rounded-lg">No couriers available at the moment.</p>
            )}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select a payment method:</h3>
            <RadioGroup value={paymentMethod || ""} onValueChange={setPaymentMethod} className="grid grid-cols-1 gap-3">
              {paymentMethods.map(method => (
                <div 
                  key={method.id}
                  className={`border p-4 rounded-lg flex items-center cursor-pointer ${
                    paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  <RadioGroupItem value={method.id} id={method.id} className="mr-4" />
                  <div className="flex-1">
                    <label htmlFor={method.id} className="font-medium cursor-pointer block">
                      {method.name}
                    </label>
                  </div>
                  <method.icon className="text-gray-400 h-5 w-5" />
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Review your order</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Address:</span>
                <span className="font-medium">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Courier:</span>
                <span className="font-medium">{selectedCourierName || "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{paymentMethods.find(m => m.id === paymentMethod)?.name || "Not selected"}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>P{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg text-amber-700 text-sm">
              By placing this order, you agree to our terms and conditions and privacy policy.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getStepIndicator = () => {
    return (
      <div className="flex justify-center mb-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === index 
                  ? 'bg-primary text-white' 
                  : step > index 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step > index ? <CheckCheck className="h-4 w-4" /> : index + 1}
            </div>
            {index < 2 && (
              <div 
                className={`h-1 w-10 ${
                  step > index ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        {isOrderComplete ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCheck className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 text-center mb-4">
              Your order has been placed successfully. You will receive a confirmation shortly.
            </p>
            <p className="font-medium">Order ID: {orderId}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Checkout Process</DialogTitle>
            </DialogHeader>
            
            {getStepIndicator()}
            
            {renderStepContent()}
            
            <div className="flex justify-between mt-6">
              {step > 0 && (
                <Button variant="outline" onClick={handleBack} disabled={isProcessing}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <div className="flex-1" />
              <Button 
                onClick={handleNext} 
                disabled={isProcessing || (step === 0 && !selectedCourierId) || (step === 1 && !paymentMethod)}
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
