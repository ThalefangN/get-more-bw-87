
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Courier, DeliveryRequest, CourierContextType } from '@/types/courier';
import { useCourierApi } from '@/hooks/useCourierApi';
import { formatCourierFromData } from '@/utils/courierUtils';

const CourierContext = createContext<CourierContextType | undefined>(undefined);

export const CourierProvider = ({ children }: { children: ReactNode }) => {
  const [currentCourier, setCurrentCourier] = useState<Courier | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  const {
    deliveryRequests,
    allCouriers,
    setAllCouriers,
    fetchAllCouriers,
    fetchRealTimeDeliveries,
    setupRealTimeSubscription,
    acceptDelivery,
    updateDeliveryStatus,
    updateCourierAvailability
  } = useCourierApi(currentCourier);

  useEffect(() => {
    const storedCourierInfo = localStorage.getItem('courierInfo');
    if (storedCourierInfo) {
      try {
        const parsedCourier = JSON.parse(storedCourierInfo);
        setCurrentCourier(parsedCourier);
        setIsAuthenticated(true);
        
        fetchRealTimeDeliveries();
        const channel = setupRealTimeSubscription();
        
        return () => {
          // Cleanup realtime subscription
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Failed to parse courier info from localStorage:', error);
        localStorage.removeItem('courierInfo');
      }
    }
    
    fetchAllCouriers();
  }, []);

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
    await updateCourierAvailability(currentCourier.id, isAvailable);
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
