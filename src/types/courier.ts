
export interface Courier {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  status: string;
  rating: number;
  deliveries: number;
  notes?: string;
  created_at: string;
  registered_at: string;
  created_by_admin: boolean;
  isAvailable?: boolean; // Add this for compatibility
  completedDeliveries?: number; // Add this for compatibility
}

export interface DeliveryRequest {
  id: string;
  orderId: string;
  storeId: string;
  storeName: string;
  customerAddress: string;
  customerName: string;
  customerContact: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  courierId?: string;
  items: any[];
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
  toggleAvailability: (isAvailable: boolean) => Promise<void>;
  updateLocation: (location: string) => void;
  acceptDelivery: (requestId: string) => Promise<void>;
  updateDeliveryStatus: (requestId: string, status: DeliveryRequest['status'], timestamp?: Date) => Promise<void>;
  getAllCouriers: () => Courier[];
  getAvailableCouriers: () => Courier[];
  fetchRealTimeDeliveries: () => Promise<void>;
}
