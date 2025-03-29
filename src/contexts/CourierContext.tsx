
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from './StoreContext';

export interface Courier {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: 'car' | 'motorcycle' | 'bicycle';
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
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  courierId?: string;
}

interface CourierContextType {
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
}

const CourierContext = createContext<CourierContextType | undefined>(undefined);

export const CourierProvider = ({ children }: { children: ReactNode }) => {
  const [currentCourier, setCurrentCourier] = useState<Courier | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [allCouriers, setAllCouriers] = useState<Courier[]>([]);

  // Load stored data on mount
  useEffect(() => {
    const storedCourierInfo = localStorage.getItem('courierInfo');
    if (storedCourierInfo) {
      try {
        const parsedCourier = JSON.parse(storedCourierInfo);
        setCurrentCourier(parsedCourier);
        setIsAuthenticated(true);
        
        // Load this courier's delivery requests
        loadCourierDeliveries(parsedCourier.id);
      } catch (error) {
        console.error('Failed to parse courier info from localStorage:', error);
        localStorage.removeItem('courierInfo');
      }
    }
    
    // Load all couriers
    const storedAllCouriers = localStorage.getItem('allCouriers');
    if (storedAllCouriers) {
      try {
        setAllCouriers(JSON.parse(storedAllCouriers));
      } catch (error) {
        console.error('Failed to parse all couriers from localStorage:', error);
      }
    }
  }, []);

  const loadCourierDeliveries = (courierId: string) => {
    const storedDeliveries = localStorage.getItem('deliveryRequests');
    if (storedDeliveries) {
      try {
        const allDeliveries = JSON.parse(storedDeliveries);
        
        // Filter for this courier's deliveries and pending ones
        const courierDeliveries = allDeliveries.filter(
          (d: DeliveryRequest) => 
            (d.courierId === courierId) || 
            (d.status === 'pending' && !d.courierId)
        );
        
        setDeliveryRequests(courierDeliveries);
      } catch (error) {
        console.error('Failed to parse deliveries from localStorage:', error);
      }
    }
  };

  const login = (courierData: Courier) => {
    setCurrentCourier(courierData);
    setIsAuthenticated(true);
    localStorage.setItem('courierInfo', JSON.stringify(courierData));
    
    // Update all couriers list if this is a new courier
    const existingCourierIndex = allCouriers.findIndex(c => c.id === courierData.id);
    if (existingCourierIndex === -1) {
      const updatedCouriers = [...allCouriers, courierData];
      setAllCouriers(updatedCouriers);
      localStorage.setItem('allCouriers', JSON.stringify(updatedCouriers));
    } else {
      const updatedCouriers = [...allCouriers];
      updatedCouriers[existingCourierIndex] = courierData;
      setAllCouriers(updatedCouriers);
      localStorage.setItem('allCouriers', JSON.stringify(updatedCouriers));
    }
    
    // Load this courier's deliveries
    loadCourierDeliveries(courierData.id);
  };

  const logout = () => {
    setCurrentCourier(null);
    setIsAuthenticated(false);
    setDeliveryRequests([]);
    localStorage.removeItem('courierInfo');
  };

  const toggleAvailability = (isAvailable: boolean) => {
    if (!currentCourier) return;
    
    const updatedCourier = { ...currentCourier, isAvailable };
    setCurrentCourier(updatedCourier);
    localStorage.setItem('courierInfo', JSON.stringify(updatedCourier));
    
    // Update in all couriers list
    const updatedCouriers = allCouriers.map(courier => 
      courier.id === currentCourier.id ? { ...courier, isAvailable } : courier
    );
    setAllCouriers(updatedCouriers);
    localStorage.setItem('allCouriers', JSON.stringify(updatedCouriers));
  };

  const updateLocation = (location: string) => {
    if (!currentCourier) return;
    
    const updatedCourier = { ...currentCourier, currentLocation: location };
    setCurrentCourier(updatedCourier);
    localStorage.setItem('courierInfo', JSON.stringify(updatedCourier));
    
    // Update in all couriers list
    const updatedCouriers = allCouriers.map(courier => 
      courier.id === currentCourier.id ? updatedCourier : courier
    );
    setAllCouriers(updatedCouriers);
    localStorage.setItem('allCouriers', JSON.stringify(updatedCouriers));
  };

  const acceptDelivery = (requestId: string) => {
    if (!currentCourier) return;
    
    const now = new Date();
    const updatedRequests = deliveryRequests.map(request => 
      request.id === requestId ? {
        ...request,
        status: 'accepted' as const,
        acceptedAt: now,
        courierId: currentCourier.id
      } : request
    );
    
    setDeliveryRequests(updatedRequests);
    
    // Update in localStorage
    const storedDeliveries = localStorage.getItem('deliveryRequests');
    if (storedDeliveries) {
      try {
        const allDeliveries = JSON.parse(storedDeliveries);
        const updatedAllDeliveries = allDeliveries.map((d: DeliveryRequest) => 
          d.id === requestId ? {
            ...d,
            status: 'accepted',
            acceptedAt: now,
            courierId: currentCourier.id
          } : d
        );
        localStorage.setItem('deliveryRequests', JSON.stringify(updatedAllDeliveries));
      } catch (error) {
        console.error('Failed to accept delivery in localStorage:', error);
      }
    }
    
    // Also update the order status in the store orders
    const storedOrders = localStorage.getItem('storeOrders');
    if (storedOrders) {
      try {
        const allOrders = JSON.parse(storedOrders);
        const request = deliveryRequests.find(r => r.id === requestId);
        
        if (request) {
          const updatedAllOrders = allOrders.map((o: Order) => 
            o.id === request.orderId ? { ...o, status: 'delivering', courierAssigned: currentCourier.id } : o
          );
          localStorage.setItem('storeOrders', JSON.stringify(updatedAllOrders));
        }
      } catch (error) {
        console.error('Failed to update order status in localStorage:', error);
      }
    }
  };

  const updateDeliveryStatus = (requestId: string, status: DeliveryRequest['status'], timestamp: Date = new Date()) => {
    if (!currentCourier) return;
    
    const updatedRequests = deliveryRequests.map(request => {
      if (request.id === requestId) {
        const updates: Partial<DeliveryRequest> = { status };
        
        if (status === 'picked_up') {
          updates.pickedUpAt = timestamp;
        } else if (status === 'delivered') {
          updates.deliveredAt = timestamp;
        }
        
        return { ...request, ...updates };
      }
      return request;
    });
    
    setDeliveryRequests(updatedRequests);
    
    // Update in localStorage
    const storedDeliveries = localStorage.getItem('deliveryRequests');
    if (storedDeliveries) {
      try {
        const allDeliveries = JSON.parse(storedDeliveries);
        const updatedAllDeliveries = allDeliveries.map((d: DeliveryRequest) => {
          if (d.id === requestId) {
            const updates: Partial<DeliveryRequest> = { status };
            
            if (status === 'picked_up') {
              updates.pickedUpAt = timestamp;
            } else if (status === 'delivered') {
              updates.deliveredAt = timestamp;
            }
            
            return { ...d, ...updates };
          }
          return d;
        });
        
        localStorage.setItem('deliveryRequests', JSON.stringify(updatedAllDeliveries));
      } catch (error) {
        console.error('Failed to update delivery status in localStorage:', error);
      }
    }
    
    // Also update the order status in store orders if delivered
    if (status === 'delivered') {
      const storedOrders = localStorage.getItem('storeOrders');
      if (storedOrders) {
        try {
          const allOrders = JSON.parse(storedOrders);
          const request = deliveryRequests.find(r => r.id === requestId);
          
          if (request) {
            const updatedAllOrders = allOrders.map((o: Order) => 
              o.id === request.orderId ? { ...o, status: 'completed' } : o
            );
            localStorage.setItem('storeOrders', JSON.stringify(updatedAllOrders));
          }
        } catch (error) {
          console.error('Failed to update order status in localStorage:', error);
        }
      }
      
      // Update courier completed deliveries count
      if (currentCourier) {
        const updatedCourier = { 
          ...currentCourier, 
          completedDeliveries: (currentCourier.completedDeliveries || 0) + 1 
        };
        setCurrentCourier(updatedCourier);
        localStorage.setItem('courierInfo', JSON.stringify(updatedCourier));
        
        // Update in all couriers list
        const updatedCouriers = allCouriers.map(courier => 
          courier.id === currentCourier.id ? updatedCourier : courier
        );
        setAllCouriers(updatedCouriers);
        localStorage.setItem('allCouriers', JSON.stringify(updatedCouriers));
      }
    }
  };

  const getAllCouriers = () => {
    return allCouriers;
  };

  const getAvailableCouriers = () => {
    return allCouriers.filter(courier => courier.isAvailable);
  };

  // Filter delivery requests into categories
  const activeDeliveries = deliveryRequests.filter(
    delivery => 
      (delivery.courierId === currentCourier?.id) && 
      ['accepted', 'picked_up'].includes(delivery.status)
  );
  
  const deliveryHistory = deliveryRequests.filter(
    delivery => 
      (delivery.courierId === currentCourier?.id) && 
      ['delivered', 'cancelled'].includes(delivery.status)
  );

  return (
    <CourierContext.Provider value={{
      currentCourier,
      isAuthenticated,
      deliveryRequests,
      activeDeliveries,
      deliveryHistory,
      login,
      logout,
      toggleAvailability,
      updateLocation,
      acceptDelivery,
      updateDeliveryStatus,
      getAllCouriers,
      getAvailableCouriers
    }}>
      {children}
    </CourierContext.Provider>
  );
};

export const useCourier = () => {
  const context = useContext(CourierContext);
  if (context === undefined) {
    throw new Error('useCourier must be used within a CourierProvider');
  }
  return context;
};
