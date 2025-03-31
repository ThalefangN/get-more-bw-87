
import { ShoppingBag, MapPin, Truck, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Courier } from "@/types/courier";
import { paymentMethods } from "./PaymentMethodSelection";

interface OrderSummaryProps {
  address: string;
  selectedCourier: Courier | undefined;
  paymentMethod: string | null;
  totalPrice: number;
}

const OrderSummary = ({ address, selectedCourier, paymentMethod, totalPrice }: OrderSummaryProps) => {
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
            {selectedCourier?.name || "Not selected"}
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
};

export default OrderSummary;
