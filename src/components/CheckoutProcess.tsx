
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCheck, CreditCard, Smartphone, ArrowRight, ArrowLeft, Truck, ShoppingBag, MapPin, Building, Clock, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { Courier } from "@/types/courier";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";

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
  const [selectedCourierEmail, setSelectedCourierEmail] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(true);
  
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
      setIsLoadingCouriers(true);
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
          return;
        }

        if (data) {
          console.log("Fetched couriers:", data);
          setAvailableCouriers(data as Courier[]);
        }
      } catch (error) {
        console.error("Unexpected error fetching couriers:", error);
        toast({
          title: "Unexpected Error",
          description: "An unexpected error occurred while fetching couriers.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCouriers(false);
      }
    };

    if (step === 0) {
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
      setSelectedCourierEmail(selectedCourier.email);
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
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-lg mb-4 border border-emerald-100">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 mr-2" />
                <div>
                  <p className="font-medium text-emerald-800">Delivery Address:</p>
                  <p className="text-gray-700">{address}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center mb-3">
              <Truck className="h-5 w-5 text-emerald-600 mr-2" />
              <h3 className="text-lg font-medium">Select a courier:</h3>
            </div>
            
            {isLoadingCouriers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : availableCouriers.length > 0 ? (
              <RadioGroup value={selectedCourierId || ""} onValueChange={handleCourierSelect} className="grid grid-cols-1 gap-3">
                {availableCouriers.map(courier => (
                  <div 
                    key={courier.id}
                    className={`border p-4 rounded-lg flex items-center cursor-pointer transition-all ${
                      selectedCourierId === courier.id 
                        ? 'border-emerald-400 bg-emerald-50 shadow-sm' 
                        : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50'
                    }`}
                  >
                    <RadioGroupItem value={courier.id} id={courier.id} className="mr-4" />
                    <div className="flex-1">
                      <label htmlFor={courier.id} className="font-medium cursor-pointer block">
                        {courier.name}
                      </label>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-3">Vehicle: {courier.vehicle_type}</span>
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          <span>{courier.deliveries} deliveries</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                        courier.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {courier.status === 'active' ? 'Available' : 'Busy'}
                      </div>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg 
                            key={star} 
                            className={`w-3 h-3 ${star <= courier.rating ? 'text-amber-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-lg flex items-center">
                <Clock className="h-5 w-5 text-amber-600 mr-2" />
                <p>No couriers available at the moment. Please try again later.</p>
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-3">
              <CreditCard className="h-5 w-5 text-emerald-600 mr-2" />
              <h3 className="text-lg font-medium">Select a payment method:</h3>
            </div>
            <RadioGroup value={paymentMethod || ""} onValueChange={setPaymentMethod} className="grid grid-cols-1 gap-3">
              {paymentMethods.map(method => (
                <div 
                  key={method.id}
                  className={`border p-4 rounded-lg flex items-center cursor-pointer transition-all ${
                    paymentMethod === method.id 
                      ? 'border-emerald-400 bg-emerald-50 shadow-sm' 
                      : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50'
                  }`}
                >
                  <RadioGroupItem value={method.id} id={method.id} className="mr-4" />
                  <div className="flex items-center flex-1">
                    <method.icon className={`h-5 w-5 ${
                      paymentMethod === method.id ? 'text-emerald-600' : 'text-gray-400'
                    } mr-3`} />
                    <label htmlFor={method.id} className="font-medium cursor-pointer block">
                      {method.name}
                    </label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-3">
              <ShoppingBag className="h-5 w-5 text-emerald-600 mr-2" />
              <h3 className="text-lg font-medium">Review your order</h3>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-lg space-y-3 border border-emerald-100">
              <div className="flex justify-between">
                <span className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  Delivery Address:
                </span>
                <span className="font-medium">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center text-gray-600">
                  <Truck className="h-4 w-4 mr-2" />
                  Courier:
                </span>
                <span className="font-medium">
                  {availableCouriers.find(c => c.id === selectedCourierId)?.name || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center text-gray-600">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Method:
                </span>
                <span className="font-medium">{paymentMethods.find(m => m.id === paymentMethod)?.name || "Not selected"}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-emerald-800">
                <span>Total:</span>
                <span>P{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg text-amber-700 text-sm border border-amber-100">
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
                  ? 'bg-emerald-600 text-white' 
                  : step > index 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step > index ? <CheckCheck className="h-4 w-4" /> : index + 1}
            </div>
            {index < 2 && (
              <div 
                className={`h-1 w-10 ${
                  step > index ? 'bg-emerald-500' : 'bg-gray-200'
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
      <DialogContent className="sm:max-w-[500px] bg-white">
        {isOrderComplete ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 text-center mb-4">
              Your order has been placed successfully. You will receive a confirmation shortly.
            </p>
            <p className="font-medium">Order ID: {orderId}</p>
          </div>
        ) : (
          <>
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-center text-xl flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-emerald-600" />
                Checkout Process
              </DialogTitle>
            </DialogHeader>
            
            {getStepIndicator()}
            
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
