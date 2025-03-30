import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types/order';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  fetchRealTimeDeliveries: () => Promise<void>;
}

const CourierContext = createContext<CourierContextType | undefined>(undefined);

export const CourierProvider = ({ children }: { children: ReactNode }) => {
  const [currentCourier, setCurrentCourier] = useState<Courier | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [allCouriers, setAllCouriers] = useState<Courier[]>([]);

  useEffect(() => {
    const storedCourierInfo = localStorage.getItem('courierInfo');
    if (storedCourierInfo) {
      try {
        const parsedCourier = JSON.parse(storedCourierInfo);
        setCurrentCourier(parsedCourier);
        setIsAuthenticated(true);
        
        fetchRealTimeDeliveries();
        setupRealTimeSubscription();
      } catch (error) {
        console.error('Failed to parse courier info from localStorage:', error);
        localStorage.removeItem('courierInfo');
      }
    }
    
    fetchAllCouriers();

    return () => {
      // Cleanup realtime subscription
      const channel = supabase.channel('orders-changes');
      supabase.removeChannel(channel);
    };
  }, []);

  const setupRealTimeSubscription = () => {
    // Subscribe to order changes
    const channel = supabase.channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Orders change received:', payload);
          fetchRealTimeDeliveries();
        }
      )
      .subscribe();
  };

  const fetchAllCouriers = async () => {
    try {
      const { data, error } = await supabase
        .from('couriers')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      
      if (data) {
        const formattedCouriers = data.map(courier => ({
          id: courier.id,
          name: courier.name,
          email: courier.email,
          phone: courier.phone,
          vehicleType: courier.vehicle_type,
          isAvailable: true,
          rating: courier.rating || 0,
          completedDeliveries: courier.deliveries || 0
        }));
        
        setAllCouriers(formattedCouriers);
        localStorage.setItem('allCouriers', JSON.stringify(formattedCouriers));
      }
    } catch (error) {
      console.error('Failed to fetch couriers:', error);
    }
  };

  const fetchRealTimeDeliveries = async () => {
    if (!currentCourier) return;
    
    try {
      // Fetch orders assigned to this courier
      const { data: assignedOrders, error: assignedError } = await supabase
        .from('orders')
        .select('*')
        .eq('courier_assigned', currentCourier.email);
      
      // Fetch pending orders that need couriers
      const { data: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*')
        .or('courier_assigned.is.null,status.eq.pending');

      if (assignedError) throw assignedError;
      if (pendingError) throw pendingError;
      
      // Fetch store details for each order
      const storeIds = new Set([
        ...(assignedOrders || []).map(order => order.store_id),
        ...(pendingOrders || []).map(order => order.store_id)
      ]);
      
      const storeDetailsMap: Record<string, any> = {};
      
      if (storeIds.size > 0) {
        const { data: storesData } = await supabase
          .from('stores')
          .select('*')
          .in('id', Array.from(storeIds));
          
        if (storesData) {
          storesData.forEach(store => {
            storeDetailsMap[store.id] = store;
          });
        }
      }
      
      // Format delivery requests with correct status type
      const formatted: DeliveryRequest[] = [
        ...(assignedOrders || []).map(order => ({
          id: order.id,
          orderId: order.id,
          storeId: order.store_id,
          storeName: storeDetailsMap[order.store_id]?.name || 'Unknown Store',
          customerAddress: order.address,
          status: mapOrderStatusToDeliveryStatus(order.status),
          createdAt: new Date(order.created_at),
          courierId: currentCourier.id
        })),
        ...(pendingOrders || []).filter(order => !order.courier_assigned).map(order => ({
          id: order.id,
          orderId: order.id,
          storeId: order.store_id,
          storeName: storeDetailsMap[order.store_id]?.name || 'Unknown Store',
          customerAddress: order.address,
          status: 'pending' as const,
          createdAt: new Date(order.created_at)
        }))
      ];
      
      setDeliveryRequests(formatted);
      
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      toast.error('Failed to load delivery requests');
    }
  };

  const mapOrderStatusToDeliveryStatus = (status: string): DeliveryRequest['status'] => {
    switch (status) {
      case 'pending': return 'pending';
      case 'delivery_accepted': return 'accepted';
      case 'picked_up': return 'picked_up';
      case 'delivered': return 'delivered';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  const login = (courierData: Courier) => {
    setCurrentCourier(courierData);
    setIsAuthenticated(true);
    localStorage.setItem('courierInfo', JSON.stringify(courierData));
    
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
    
    fetchRealTimeDeliveries();
    setupRealTimeSubscription();
  };

  const logout = () => {
    setCurrentCourier(null);
    setIsAuthenticated(false);
    setDeliveryRequests([]);
    localStorage.removeItem('courierInfo');
  };

  const toggleAvailability = async (isAvailable: boolean) => {
    if (!currentCourier) return;
    
    const updatedCourier = { ...currentCourier, isAvailable };
    setCurrentCourier(updatedCourier);
    localStorage.setItem('courierInfo', JSON.stringify(updatedCourier));
    
    const updatedCouriers = allCouriers.map(courier => 
      courier.id === currentCourier.id ? { ...courier, isAvailable } : courier
    );
    setAllCouriers(updatedCouriers);
    localStorage.setItem('allCouriers', JSON.stringify(updatedCouriers));
    
    // Update availability in the database
    try {
      await supabase
        .from('couriers')
        .update({ status: isAvailable ? 'active' : 'inactive' })
        .eq('id', currentCourier.id);
    } catch (error) {
      console.error('Failed to update courier availability:', error);
    }
  };

  const updateLocation = (location: string) => {
    if (!currentCourier) return;
    
    const updatedCourier = { ...currentCourier, currentLocation: location };
    setCurrentCourier(updatedCourier);
    localStorage.setItem('courierInfo', JSON.stringify(updatedCourier));
    
    const updatedCouriers = allCouriers.map(courier => 
      courier.id === currentCourier.id ? updatedCourier : courier
    );
    setAllCouriers(updatedCouriers);
    localStorage.setItem('allCouriers', JSON.stringify(updatedCouriers));
  };

  const acceptDelivery = async (requestId: string) => {
    if (!currentCourier) return;
    
    const now = new Date();
    
    try {
      // Update the order in Supabase
      const { error } = await supabase
        .from('orders')
        .update({
          courier_assigned: currentCourier.email,
          status: 'delivery_accepted'
        })
        .eq('id', requestId);
      
      if (error) throw error;
      
      // Update local state
      const updatedRequests = deliveryRequests.map(request => 
        request.id === requestId ? {
          ...request,
          status: 'accepted' as const,
          acceptedAt: now,
          courierId: currentCourier.id
        } : request
      );
      
      setDeliveryRequests(updatedRequests);
      toast.success('Delivery accepted');
      
    } catch (error) {
      console.error('Failed to accept delivery:', error);
      toast.error('Failed to accept delivery');
    }
  };

  const updateDeliveryStatus = async (requestId: string, status: DeliveryRequest['status'], timestamp: Date = new Date()) => {
    if (!currentCourier) return;
    
    try {
      // Update the order in Supabase
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', requestId);
      
      if (error) throw error;
      
      // Update local state
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
      
      if (status === 'delivered') {
        // Update courier's completed deliveries count
        if (currentCourier) {
          const updatedCourier = { 
            ...currentCourier, 
            completedDeliveries: (currentCourier.completedDeliveries || 0) + 1 
          };
          setCurrentCourier(updatedCourier);
          localStorage.setItem('courierInfo', JSON.stringify(updatedCourier));
          
          const updatedCouriers = allCouriers.map(courier => 
            courier.id === currentCourier.id ? updatedCourier : courier
          );
          setAllCouriers(updatedCouriers);
          localStorage.setItem('allCouriers', JSON.stringify(updatedCouriers));
          
          // Update in database
          await supabase
            .from('couriers')
            .update({ deliveries: updatedCourier.completedDeliveries })
            .eq('id', currentCourier.id);
        }
      }
      
      toast.success(`Order marked as ${status.replace('_', ' ')}`);
      
    } catch (error) {
      console.error('Failed to update delivery status:', error);
      toast.error('Failed to update status');
    }
  };

  const getAllCouriers = () => {
    return allCouriers;
  };

  const getAvailableCouriers = () => {
    return allCouriers.filter(courier => courier.isAvailable);
  };

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
      getAvailableCouriers,
      fetchRealTimeDeliveries
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
