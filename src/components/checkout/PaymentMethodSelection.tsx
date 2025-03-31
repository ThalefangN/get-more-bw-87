
import { CreditCard, Smartphone } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    </div>
  );
};

export default PaymentMethodSelection;
export { paymentMethods };
