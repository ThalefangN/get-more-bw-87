
export interface Courier {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: 'car' | 'motorcycle' | 'bicycle' | string;
  isAvailable: boolean;
  currentLocation?: string;
  rating: number;
  completedDeliveries: number;
}

export interface DeliveryRequest {
  id: string;
  orderId: string;
  storeId: string;
  storeName: string;
  customerAddress: string;
  customerName: string;
  customerContact?: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  courierId?: string;
  items?: any[];
  customerId?: string;
}

export interface CourierContextType {
  currentCourier: Courier | null;
  isAuthenticated: boolean;
  deliveryRequests: DeliveryRequest[];
  activeDeliveries: DeliveryRequest[];
  deliveryHistory: DeliveryRequest[];
  login: (courierData: Courier) => void;
  logout: () => void;
  toggleAvailability: (isAvailable: boolean) => void;
  updateLocation: (location: string) => void;
  acceptDelivery: (requestId: string) => void;
  updateDeliveryStatus: (requestId: string, status: DeliveryRequest['status'], timestamp?: Date) => void;
  getAllCouriers: () => Courier[];
  getAvailableCouriers: () => Courier[];
  fetchRealTimeDeliveries: () => Promise<void>;
}
