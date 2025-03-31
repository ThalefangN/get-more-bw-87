
import { CheckCheck } from "lucide-react";

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
      <p className="font-medium">Order ID: {orderId}</p>
    </div>
  );
};

export default OrderSuccess;
