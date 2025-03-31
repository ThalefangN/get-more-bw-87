
import { CheckCheck, Truck, MapPin, ShoppingBag } from "lucide-react";

interface OrderSuccessProps {
  orderId: string | null;
}

const OrderSuccess = ({ orderId }: OrderSuccessProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
        <CheckCheck className="h-8 w-8 text-emerald-600" />
      </div>
      <h2 className="text-xl font-bold mb-2">Order Confirmed!</h2>
      <p className="text-gray-600 text-center mb-4">
        Your order has been placed successfully. You will receive a confirmation shortly.
      </p>
      
      <div className="bg-emerald-50 p-4 rounded-lg mb-4 w-full max-w-md">
        <div className="flex items-start mb-3">
          <ShoppingBag className="h-5 w-5 text-emerald-600 mt-0.5 mr-2" />
          <div>
            <p className="font-medium">Order ID: </p>
            <p className="text-sm text-gray-700 font-mono">{orderId}</p>
          </div>
        </div>
        
        <div className="flex items-start mb-3">
          <Truck className="h-5 w-5 text-emerald-600 mt-0.5 mr-2" />
          <div>
            <p className="font-medium">Delivery Status:</p>
            <p className="text-sm text-gray-700">A courier has been assigned to your order</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 mr-2" />
          <div>
            <p className="font-medium">Tracking:</p>
            <p className="text-sm text-gray-700">You will receive tracking information soon</p>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-emerald-600 font-medium">Thank you for your purchase!</p>
    </div>
  );
};

export default OrderSuccess;
