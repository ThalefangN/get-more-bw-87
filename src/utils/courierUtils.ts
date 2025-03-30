
import { DeliveryRequest } from "@/types/courier";

export const mapOrderStatusToDeliveryStatus = (status: string): DeliveryRequest['status'] => {
  switch (status) {
    case 'pending': return 'pending';
    case 'delivery_accepted': return 'accepted';
    case 'picked_up': return 'picked_up';
    case 'delivered': return 'delivered';
    case 'cancelled': return 'cancelled';
    default: return 'pending';
  }
};

export const formatCourierFromData = (courierData: any) => {
  return {
    id: courierData.id,
    name: courierData.name,
    email: courierData.email,
    phone: courierData.phone,
    vehicleType: courierData.vehicle_type,
    isAvailable: true,
    rating: courierData.rating || 0,
    completedDeliveries: courierData.deliveries || 0
  };
};
