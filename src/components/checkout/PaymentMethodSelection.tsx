
import { useState } from "react";
import { CreditCard, Smartphone, Calendar, Users, Lock } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const paymentMethods: PaymentMethod[] = [
  { id: "bank", name: "Bank Transfer", icon: CreditCard },
  { id: "myzaka", name: "MyZaka", icon: Smartphone },
  { id: "smega", name: "Smega", icon: Smartphone },
  { id: "orange", name: "Orange Money", icon: Smartphone },
];

interface PaymentMethodSelectionProps {
  paymentMethod: string | null;
  onPaymentMethodChange: (method: string) => void;
}

const PaymentMethodSelection = ({ paymentMethod, onPaymentMethodChange }: PaymentMethodSelectionProps) => {
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiryDate(e.target.value));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-3">
        <CreditCard className="h-5 w-5 text-emerald-600 mr-2" />
        <h3 className="text-lg font-medium">Select a payment method:</h3>
      </div>
      <RadioGroup value={paymentMethod || ""} onValueChange={onPaymentMethodChange} className="grid grid-cols-1 gap-3">
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

      {/* Bank payment form */}
      {paymentMethod === 'bank' && (
        <div className="mt-6 animate-fade-in">
          <div className="relative mb-6 p-4 bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-lg shadow-lg text-white">
            <div className="absolute top-2 right-2">
              <CreditCard className="h-8 w-8 text-white opacity-80" />
            </div>
            <div className="text-xs uppercase tracking-wider mb-6">Bank Card</div>
            <div className="text-xl tracking-widest mb-4 font-mono">{cardNumber || '•••• •••• •••• ••••'}</div>
            <div className="flex justify-between">
              <div>
                <div className="text-xs opacity-75">Card Holder</div>
                <div className="text-sm font-semibold truncate max-w-[120px]">{cardName || 'YOUR NAME'}</div>
              </div>
              <div>
                <div className="text-xs opacity-75">Expires</div>
                <div className="text-sm font-semibold">{expiry || 'MM/YY'}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="card-number">Card Number</Label>
              <Input 
                id="card-number" 
                value={cardNumber} 
                onChange={handleCardNumberChange}
                className="font-mono"
                maxLength={19}
                placeholder="1234 5678 9012 3456"
              />
            </div>
            
            <div>
              <Label htmlFor="card-name">Cardholder Name</Label>
              <Input 
                id="card-name" 
                value={cardName} 
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry" className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Expiry Date
                </Label>
                <Input 
                  id="expiry" 
                  value={expiry} 
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv" className="flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  CVV
                </Label>
                <Input 
                  id="cvv" 
                  value={cvv} 
                  onChange={(e) => setCvv(e.target.value)}
                  type="password"
                  maxLength={3}
                  placeholder="123"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelection;
export { paymentMethods };
