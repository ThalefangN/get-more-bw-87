
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Truck, CreditCard, Check, Star, Clock, MapPin, Phone, User, Calendar, CreditCard as CardIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CheckoutProcessProps {
  onClose: () => void;
}

const Couriers = [
  {
    id: 'courier-1',
    name: 'Express Delivery',
    eta: '30-45 min',
    fee: 25,
    rating: 4.8,
    ratingsCount: 120,
    image: 'https://ui-avatars.com/api/?name=Express&background=8B5CF6&color=fff'
  },
  {
    id: 'courier-2',
    name: 'Standard Delivery',
    eta: '1-2 hours',
    fee: 15,
    rating: 4.5,
    ratingsCount: 85,
    image: 'https://ui-avatars.com/api/?name=Standard&background=0EA5E9&color=fff'
  },
  {
    id: 'courier-3',
    name: 'Economy Delivery',
    eta: '2-3 hours',
    fee: 10,
    rating: 4.2,
    ratingsCount: 65,
    image: 'https://ui-avatars.com/api/?name=Economy&background=2DD4BF&color=fff'
  }
];

const PaymentMethods = [
  {
    id: 'card',
    name: 'Debit/Credit Card',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Pay securely with your card'
  },
  {
    id: 'orange',
    name: 'Orange Money',
    icon: <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">O</div>,
    description: 'Pay using Orange Money'
  },
  {
    id: 'myzaka',
    name: 'MyZaka',
    icon: <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">M</div>,
    description: 'Pay using MyZaka'
  },
  {
    id: 'smega',
    name: 'Smega',
    icon: <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">S</div>,
    description: 'Pay using Smega'
  }
];

const CheckoutProcess = ({ onClose }: CheckoutProcessProps) => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState<'address' | 'courier' | 'payment' | 'confirmation' | 'success'>('address');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    instructions: ''
  });
  
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [mobilePaymentDetails, setMobilePaymentDetails] = useState({
    fullName: '',
    phoneNumber: '',
    reference: '',
    proofOfPayment: ''
  });
  
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.street || !address.city) {
      toast.error("Please provide your delivery address");
      return;
    }
    
    setStep('courier');
  };
  
  const handleCourierSelection = () => {
    if (!selectedCourier) {
      toast.error("Please select a delivery method");
      return;
    }
    
    setStep('payment');
  };
  
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    
    if (selectedPaymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.cardholderName || !cardDetails.expiryDate || !cardDetails.cvv) {
        toast.error("Please fill in all card details");
        return;
      }
      
      // Basic validation
      if (cardDetails.cardNumber.length < 16) {
        toast.error("Please enter a valid card number");
        return;
      }
    } else {
      if (!mobilePaymentDetails.fullName || !mobilePaymentDetails.phoneNumber) {
        toast.error("Please provide your name and phone number");
        return;
      }
    }
    
    setStep('confirmation');
  };
  
  const handleConfirmOrder = () => {
    setIsProcessing(true);
    
    // Simulate order processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      clearCart();
    }, 2000);
  };
  
  const selectedCourierData = selectedCourier ? Couriers.find(c => c.id === selectedCourier) : null;
  const deliveryFee = selectedCourierData ? selectedCourierData.fee : 0;
  const finalTotal = totalPrice + deliveryFee;
  
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 'address' || step === 'courier' || step === 'payment' || step === 'confirmation' || step === 'success' ? 'bg-getmore-purple text-white' : 'bg-gray-200 text-gray-500'}`}>
            1
          </div>
          <div className={`h-1 w-10 ${step === 'courier' || step === 'payment' || step === 'confirmation' || step === 'success' ? 'bg-getmore-purple' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 'courier' || step === 'payment' || step === 'confirmation' || step === 'success' ? 'bg-getmore-purple text-white' : 'bg-gray-200 text-gray-500'}`}>
            2
          </div>
          <div className={`h-1 w-10 ${step === 'payment' || step === 'confirmation' || step === 'success' ? 'bg-getmore-purple' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 'payment' || step === 'confirmation' || step === 'success' ? 'bg-getmore-purple text-white' : 'bg-gray-200 text-gray-500'}`}>
            3
          </div>
          <div className={`h-1 w-10 ${step === 'confirmation' || step === 'success' ? 'bg-getmore-purple' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 'confirmation' || step === 'success' ? 'bg-getmore-purple text-white' : 'bg-gray-200 text-gray-500'}`}>
            4
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-h-[80vh] overflow-auto">
      {step !== 'success' && (
        <div className="p-6">
          {renderStepIndicator()}
          
          <h2 className="text-2xl font-bold mb-4 text-center">
            {step === 'address' && 'Delivery Address'}
            {step === 'courier' && 'Choose Delivery Method'}
            {step === 'payment' && 'Payment Method'}
            {step === 'confirmation' && 'Confirm Order'}
          </h2>
          
          {step === 'address' && (
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="street" className="text-sm font-medium">Street Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                  <Input
                    id="street"
                    placeholder="Enter your street address"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium">City</label>
                <Input
                  id="city"
                  placeholder="Enter your city"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="instructions" className="text-sm font-medium">Delivery Instructions (Optional)</label>
                <Textarea
                  id="instructions"
                  placeholder="Apartment number, gate code, etc."
                  value={address.instructions}
                  onChange={(e) => setAddress({ ...address, instructions: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Continue
                </Button>
              </div>
            </form>
          )}
          
          {step === 'courier' && (
            <div className="space-y-4">
              <RadioGroup 
                value={selectedCourier || ''} 
                onValueChange={setSelectedCourier}
                className="space-y-3"
              >
                {Couriers.map((courier) => (
                  <div key={courier.id} className={`border rounded-lg p-4 cursor-pointer hover:border-getmore-purple transition-colors ${selectedCourier === courier.id ? 'border-getmore-purple bg-getmore-purple/5' : ''}`}>
                    <RadioGroupItem value={courier.id} id={courier.id} className="sr-only" />
                    <Label htmlFor={courier.id} className="flex items-start cursor-pointer">
                      <div className="flex-shrink-0 mr-4">
                        <img 
                          src={courier.image} 
                          alt={courier.name} 
                          className="w-12 h-12 rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{courier.name}</h3>
                          <span className="font-semibold">P{courier.fee.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock size={14} className="mr-1" />
                          <span>{courier.eta}</span>
                        </div>
                        <div className="flex items-center text-sm mt-1">
                          <div className="flex items-center text-yellow-500">
                            <Star size={14} className="fill-yellow-500" />
                            <span className="ml-1 text-gray-700">{courier.rating}</span>
                          </div>
                          <span className="text-gray-500 text-xs ml-1">({courier.ratingsCount} ratings)</span>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setStep('address')}>
                  Back
                </Button>
                <Button onClick={handleCourierSelection}>
                  Continue
                </Button>
              </div>
            </div>
          )}
          
          {step === 'payment' && (
            <div className="space-y-4">
              <RadioGroup 
                value={selectedPaymentMethod || ''} 
                onValueChange={setSelectedPaymentMethod}
                className="space-y-3 mb-6"
              >
                {PaymentMethods.map((method) => (
                  <div key={method.id} className={`border rounded-lg p-4 cursor-pointer hover:border-getmore-purple transition-colors ${selectedPaymentMethod === method.id ? 'border-getmore-purple bg-getmore-purple/5' : ''}`}>
                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                    <Label htmlFor={method.id} className="flex items-center cursor-pointer">
                      <div className="mr-3">
                        {method.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{method.name}</h3>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              {selectedPaymentMethod && (
                <form onSubmit={handlePaymentSubmit}>
                  {selectedPaymentMethod === 'card' && (
                    <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                      <h3 className="font-medium">Card Details</h3>
                      
                      <div className="space-y-2">
                        <label htmlFor="cardNumber" className="text-sm font-medium">Card Number</label>
                        <div className="relative">
                          <CardIcon className="absolute left-3 top-3 text-gray-400" size={16} />
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={cardDetails.cardNumber}
                            onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="cardholderName" className="text-sm font-medium">Cardholder Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 text-gray-400" size={16} />
                          <Input
                            id="cardholderName"
                            placeholder="John Doe"
                            value={cardDetails.cardholderName}
                            onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                            <Input
                              id="expiryDate"
                              placeholder="MM/YY"
                              value={cardDetails.expiryDate}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="cvv" className="text-sm font-medium">CVV</label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      
                      <Alert className="bg-blue-50 border-blue-100">
                        <AlertDescription className="text-blue-700 text-xs">
                          This is a demo. No real payment will be processed. You can enter any test data.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  
                  {(selectedPaymentMethod === 'orange' || selectedPaymentMethod === 'myzaka' || selectedPaymentMethod === 'smega') && (
                    <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                      <h3 className="font-medium">
                        {selectedPaymentMethod === 'orange' && 'Orange Money'}
                        {selectedPaymentMethod === 'myzaka' && 'MyZaka'}
                        {selectedPaymentMethod === 'smega' && 'Smega'}
                        {' '}Payment
                      </h3>
                      
                      <Tabs defaultValue="details">
                        <TabsList className="w-full grid grid-cols-2">
                          <TabsTrigger value="details">Your Details</TabsTrigger>
                          <TabsTrigger value="instructions">Payment Instructions</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="details" className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 text-gray-400" size={16} />
                              <Input
                                id="fullName"
                                placeholder="Enter your full name"
                                value={mobilePaymentDetails.fullName}
                                onChange={(e) => setMobilePaymentDetails({ ...mobilePaymentDetails, fullName: e.target.value })}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 text-gray-400" size={16} />
                              <Input
                                id="phoneNumber"
                                placeholder="e.g. +267 71234567"
                                value={mobilePaymentDetails.phoneNumber}
                                onChange={(e) => setMobilePaymentDetails({ ...mobilePaymentDetails, phoneNumber: e.target.value })}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="reference" className="text-sm font-medium">Reference Number (Optional)</label>
                            <Input
                              id="reference"
                              placeholder="Enter payment reference"
                              value={mobilePaymentDetails.reference}
                              onChange={(e) => setMobilePaymentDetails({ ...mobilePaymentDetails, reference: e.target.value })}
                            />
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="instructions" className="space-y-4 pt-4">
                          <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-3">
                            <h4 className="font-medium text-blue-800">Payment Instructions:</h4>
                            <ol className="list-decimal list-inside space-y-1 text-blue-700">
                              <li>Open your mobile money app</li>
                              <li>Select "Pay" or "Send Money"</li>
                              <li>Enter the merchant number: <span className="font-medium">71234567</span></li>
                              <li>Enter amount: <span className="font-medium">P{finalTotal.toFixed(2)}</span></li>
                              <li>Use reference: <span className="font-medium">GetMore</span></li>
                              <li>Complete the payment in your app</li>
                              <li>Enter your details in the form</li>
                            </ol>
                            <p className="text-xs text-blue-600 italic">For this demo, no actual payment is required.</p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-4 mt-4">
                    <Button type="button" variant="outline" onClick={() => setStep('courier')}>
                      Back
                    </Button>
                    <Button type="submit">
                      Continue
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
          
          {step === 'confirmation' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-medium">Order Summary</h3>
                  
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity} × {item.name}</span>
                        <span>P{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>P{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>P{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium mt-2">
                      <span>Total</span>
                      <span>P{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-medium">Delivery Details</h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Address:</span>
                      <p>{address.street}, {address.city}</p>
                      {address.instructions && (
                        <p className="text-xs text-gray-500 mt-1">{address.instructions}</p>
                      )}
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Delivery Method:</span>
                      <p>{selectedCourierData?.name}</p>
                      <p className="text-xs text-gray-500">{selectedCourierData?.eta}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-medium">Payment Method</h3>
                  
                  <div className="text-sm">
                    <p>{PaymentMethods.find(m => m.id === selectedPaymentMethod)?.name}</p>
                    {selectedPaymentMethod === 'card' && (
                      <p className="text-gray-500">
                        Card ending in {cardDetails.cardNumber.slice(-4)}
                      </p>
                    )}
                    {(selectedPaymentMethod === 'orange' || selectedPaymentMethod === 'myzaka' || selectedPaymentMethod === 'smega') && (
                      <p className="text-gray-500">
                        Phone: {mobilePaymentDetails.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setStep('payment')}>
                  Back
                </Button>
                <Button 
                  onClick={handleConfirmOrder}
                  disabled={isProcessing}
                  className="min-w-[120px]"
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : "Confirm Order"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {step === 'success' && (
        <div className="p-6 text-center h-full flex flex-col justify-center items-center space-y-6 py-12">
          <div className="rounded-full bg-green-100 p-4 inline-flex">
            <Check size={48} className="text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-green-600">Order Placed Successfully!</h2>
          
          <p className="text-gray-700 max-w-md">
            Thank you for shopping with GetMore BW. Your order has been received and will be processed shortly.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg w-full max-w-md">
            <p className="text-sm text-gray-500 mb-2">Your order details:</p>
            <p className="font-medium">Order #ORD-{Date.now().toString().substring(5, 13)}</p>
            <p className="text-sm text-gray-700">
              Estimated delivery time: {selectedCourierData?.eta}
            </p>
          </div>
          
          <div className="pt-6">
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutProcess;
