
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCourier } from "@/contexts/CourierContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, CreditCard, Smartphone, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type CheckoutStep = "courier" | "payment" | "details" | "confirmation" | "complete";

interface CheckoutProcessProps {
  onClose: () => void;
}

const CheckoutProcess = ({ onClose }: CheckoutProcessProps) => {
  const { clearCart, totalPrice } = useCart();
  const { getAvailableCouriers } = useCourier();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("courier");
  const [selectedCourier, setSelectedCourier] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  
  // Form fields for mobile money payments
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [proofOfPayment, setProofOfPayment] = useState("");
  
  // Form fields for card payments
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  const availableCouriers = getAvailableCouriers();
  
  const handleCourierSelect = (courierId: string) => {
    setSelectedCourier(courierId);
  };
  
  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
  };
  
  const handleNextStep = () => {
    if (currentStep === "courier") {
      if (!selectedCourier) {
        toast.error("Please select a courier");
        return;
      }
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      if (!paymentMethod) {
        toast.error("Please select a payment method");
        return;
      }
      
      if (paymentMethod === "card") {
        setCurrentStep("details");
      } else {
        // For mobile money options
        setCurrentStep("details");
      }
    } else if (currentStep === "details") {
      // Validate form based on payment method
      if (paymentMethod === "card") {
        if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
          toast.error("Please fill in all card details");
          return;
        }
        
        if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
          toast.error("Please enter a valid card number");
          return;
        }
        
        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
          toast.error("Please enter expiry in MM/YY format");
          return;
        }
        
        if (cardCvc.length !== 3 || !/^\d+$/.test(cardCvc)) {
          toast.error("Please enter a valid CVC");
          return;
        }
      } else {
        // Validate mobile money payment details
        if (!fullName || !phoneNumber || !proofOfPayment) {
          toast.error("Please fill in all payment details");
          return;
        }
        
        if (!/^\d{8}$/.test(phoneNumber)) {
          toast.error("Please enter a valid phone number (8 digits)");
          return;
        }
      }
      
      setIsProcessing(true);
      
      // Simulate payment processing
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep("confirmation");
      }, 2000);
    } else if (currentStep === "confirmation") {
      setShowThankYou(true);
      clearCart();
      
      // Close the thank you message after 5 seconds
      setTimeout(() => {
        setShowThankYou(false);
        onClose();
      }, 5000);
    }
  };
  
  const getStepTitle = () => {
    switch (currentStep) {
      case "courier":
        return "Select a Courier";
      case "payment":
        return "Choose Payment Method";
      case "details":
        return paymentMethod === "card" 
          ? "Enter Card Details" 
          : "Enter Payment Information";
      case "confirmation":
        return "Confirm Your Order";
      default:
        return "";
    }
  };
  
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-semibold">{getStepTitle()}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      
      {currentStep === "courier" && (
        <div className="space-y-4">
          {availableCouriers.length > 0 ? (
            <RadioGroup value={selectedCourier} onValueChange={handleCourierSelect} className="space-y-2">
              {availableCouriers.map((courier) => (
                <div 
                  key={courier.id}
                  className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCourier === courier.id ? "border-getmore-purple bg-getmore-purple/5" : "border-gray-200 hover:border-getmore-purple/50"
                  }`}
                  onClick={() => handleCourierSelect(courier.id)}
                >
                  <RadioGroupItem value={courier.id} id={`courier-${courier.id}`} />
                  <Label htmlFor={`courier-${courier.id}`} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{courier.name}</p>
                        <p className="text-sm text-gray-500">{courier.vehicleType}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center mr-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star} 
                              className={`w-4 h-4 ${star <= courier.rating ? "text-yellow-500" : "text-gray-300"}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {courier.completedDeliveries} deliveries
                        </span>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-gray-500">No couriers are available at the moment.</p>
              <p className="text-sm text-gray-400 mt-1">Please try again later.</p>
            </div>
          )}
        </div>
      )}
      
      {currentStep === "payment" && (
        <div className="space-y-4">
          <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodSelect} className="space-y-3">
            <div 
              className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === "card" ? "border-getmore-purple bg-getmore-purple/5" : "border-gray-200 hover:border-getmore-purple/50"
              }`}
              onClick={() => handlePaymentMethodSelect("card")}
            >
              <RadioGroupItem value="card" id="payment-card" />
              <Label htmlFor="payment-card" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-getmore-purple" />
                  <span>Bank Card</span>
                </div>
              </Label>
            </div>
            
            <div 
              className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === "orange" ? "border-getmore-purple bg-getmore-purple/5" : "border-gray-200 hover:border-getmore-purple/50"
              }`}
              onClick={() => handlePaymentMethodSelect("orange")}
            >
              <RadioGroupItem value="orange" id="payment-orange" />
              <Label htmlFor="payment-orange" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <Smartphone className="mr-2 h-5 w-5 text-orange-500" />
                  <span>Orange Money</span>
                </div>
              </Label>
            </div>
            
            <div 
              className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === "myzaka" ? "border-getmore-purple bg-getmore-purple/5" : "border-gray-200 hover:border-getmore-purple/50"
              }`}
              onClick={() => handlePaymentMethodSelect("myzaka")}
            >
              <RadioGroupItem value="myzaka" id="payment-myzaka" />
              <Label htmlFor="payment-myzaka" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <Smartphone className="mr-2 h-5 w-5 text-blue-500" />
                  <span>MyZaka</span>
                </div>
              </Label>
            </div>
            
            <div 
              className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === "smega" ? "border-getmore-purple bg-getmore-purple/5" : "border-gray-200 hover:border-getmore-purple/50"
              }`}
              onClick={() => handlePaymentMethodSelect("smega")}
            >
              <RadioGroupItem value="smega" id="payment-smega" />
              <Label htmlFor="payment-smega" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <Smartphone className="mr-2 h-5 w-5 text-green-500" />
                  <span>Smega</span>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}
      
      {currentStep === "details" && paymentMethod === "card" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-name">Name on Card</Label>
            <Input 
              id="card-name" 
              placeholder="John Smith" 
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <Input 
              id="card-number" 
              placeholder="4242 4242 4242 4242" 
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-expiry">Expiry Date</Label>
              <Input 
                id="card-expiry" 
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    if (value.length <= 2) {
                      setCardExpiry(value);
                    } else {
                      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
                    }
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card-cvc">CVC</Label>
              <Input 
                id="card-cvc" 
                placeholder="123"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            <p>This is a test payment. No actual charges will be made.</p>
            <p>You can use any test card details for this demonstration.</p>
          </div>
        </div>
      )}
      
      {currentStep === "details" && paymentMethod !== "card" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input 
              id="full-name" 
              placeholder="Your Full Name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone-number">Phone Number</Label>
            <Input 
              id="phone-number" 
              placeholder="71234567" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 8))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="proof-of-payment">Proof of Payment Reference</Label>
            <Input 
              id="proof-of-payment" 
              placeholder="Transaction Reference Number" 
              value={proofOfPayment}
              onChange={(e) => setProofOfPayment(e.target.value)}
            />
          </div>
          
          <div className="text-sm border-t pt-4 mt-4">
            <p className="font-medium mb-2">Payment Instructions:</p>
            {paymentMethod === "orange" && (
              <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                <li>Dial *150# from your Orange registered number</li>
                <li>Select "My Money" option</li>
                <li>Choose "Send Money"</li>
                <li>Send to 71234567</li>
                <li>Enter amount: P{totalPrice.toFixed(2)}</li>
                <li>Enter your PIN to confirm</li>
                <li>Enter the transaction reference above</li>
              </ol>
            )}
            
            {paymentMethod === "myzaka" && (
              <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                <li>Open your MyZaka app</li>
                <li>Select "Send Money" option</li>
                <li>Send to 71234567</li>
                <li>Enter amount: P{totalPrice.toFixed(2)}</li>
                <li>Add reference: "GetMore"</li>
                <li>Confirm the payment</li>
                <li>Enter the transaction reference above</li>
              </ol>
            )}
            
            {paymentMethod === "smega" && (
              <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                <li>Dial *171# from your Smega registered number</li>
                <li>Select "Send Money" option</li>
                <li>Send to 71234567</li>
                <li>Enter amount: P{totalPrice.toFixed(2)}</li>
                <li>Enter your PIN to confirm</li>
                <li>Enter the transaction reference above</li>
              </ol>
            )}
          </div>
        </div>
      )}
      
      {currentStep === "confirmation" && (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-start">
            <Check className="text-green-500 mr-3 mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-800">Payment Successful</h3>
              <p className="text-green-600 text-sm">Your payment has been processed successfully.</p>
            </div>
          </div>
          
          <div className="border rounded-lg divide-y">
            <div className="p-4">
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Subtotal:</span>
                <span>P{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Delivery Fee:</span>
                <span>P25.00</span>
              </div>
              <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                <span>Total:</span>
                <span>P{(totalPrice + 25).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium mb-2">Delivery Details</h3>
              <div className="text-sm">
                <p><span className="text-gray-500">Courier:</span> {availableCouriers.find(c => c.id === selectedCourier)?.name}</p>
                <p><span className="text-gray-500">Estimated Delivery:</span> Within 60 minutes</p>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium mb-2">Payment Method</h3>
              <div className="text-sm">
                {paymentMethod === "card" && (
                  <p><span className="text-gray-500">Bank Card:</span> **** **** **** {cardNumber.slice(-4)}</p>
                )}
                {paymentMethod !== "card" && (
                  <p className="capitalize"><span className="text-gray-500">{paymentMethod}:</span> Confirmed</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-4 border-t flex justify-end space-x-3">
        {currentStep !== "courier" && currentStep !== "confirmation" && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep === "payment" ? "courier" : "payment")}
          >
            Back
          </Button>
        )}
        
        <Button
          onClick={handleNextStep}
          disabled={isProcessing}
          className={isProcessing ? "opacity-70 cursor-not-allowed" : ""}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
              Processing...
            </div>
          ) : currentStep === "confirmation" ? (
            "Complete Order"
          ) : (
            "Continue"
          )}
        </Button>
      </div>
      
      {/* Thank You Dialog */}
      <Dialog open={showThankYou} onOpenChange={setShowThankYou}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Thank You!</DialogTitle>
            <DialogDescription className="text-center">
              <div className="mt-6 mb-4 flex justify-center">
                <div className="bg-green-100 text-green-700 rounded-full p-4">
                  <Check className="h-12 w-12" />
                </div>
              </div>
              <p className="text-lg">Your order has been placed successfully.</p>
              <p className="text-sm text-gray-500 mt-2">
                You'll receive a confirmation soon. Your items will be delivered shortly.
              </p>
              <div className="mt-6 animate-pulse text-getmore-purple font-medium">
                Thanks for shopping with GetMore BW!
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutProcess;
