
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
    isAvailable: courierData.status === 'active',
    rating: courierData.rating || 0,
    completedDeliveries: courierData.deliveries || 0
  };
};

export const formatDeliveryTime = (timestamp: Date | undefined): string => {
  if (!timestamp) return 'N/A';
  
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric'
  }).format(timestamp);
};

export const getEstimatedDeliveryTime = (pickupTime: Date | undefined): string => {
  if (!pickupTime) return 'Unknown';
  
  // Add a random time between 20-40 minutes to pickup time
  const deliveryTime = new Date(pickupTime);
  const additionalMinutes = Math.floor(Math.random() * 20) + 20; // 20-40 minutes
  deliveryTime.setMinutes(deliveryTime.getMinutes() + additionalMinutes);
  
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(deliveryTime);
};

export const getDeliveryStatusText = (status: DeliveryRequest['status']): string => {
  switch (status) {
    case 'pending': return 'Waiting for courier';
    case 'accepted': return 'Courier assigned';
    case 'picked_up': return 'Out for delivery';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    default: return 'Unknown';
  }
};
