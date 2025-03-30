import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Courier, DeliveryRequest } from '@/types/courier';
import { toast } from 'sonner';
import { mapOrderStatusToDeliveryStatus, formatCourierFromData } from '@/utils/courierUtils';

export const useCourierApi = (currentCourier: Courier | null) => {
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [allCouriers, setAllCouriers] = useState<Courier[]>([]);
  const [notificationsSent, setNotificationsSent] = useState<Record<string, boolean>>({});

  const fetchAllCouriers = async () => {
    try {
      const { data, error } = await supabase
        .from('couriers')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      
      if (data) {
        const formattedCouriers = data.map(courier => formatCourierFromData(courier));
        
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
          customerName: order.customer_name || 'Customer',
          customerContact: order.customer_contact || '',
          status: mapOrderStatusToDeliveryStatus(order.status),
          createdAt: new Date(order.created_at),
          courierId: currentCourier.id,
          items: order.items || []
        })),
        ...(pendingOrders || []).filter(order => !order.courier_assigned).map(order => ({
          id: order.id,
          orderId: order.id,
          storeId: order.store_id,
          storeName: storeDetailsMap[order.store_id]?.name || 'Unknown Store',
          customerAddress: order.address,
          customerName: order.customer_name || 'Customer',
          customerContact: order.customer_contact || '',
          status: 'pending' as const,
          createdAt: new Date(order.created_at),
          items: order.items || []
        }))
      ];
      
      setDeliveryRequests(formatted);
      
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      toast.error('Failed to load delivery requests');
    }
  };

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
      
    return channel;
  };

  const acceptDelivery = async (requestId: string) => {
    if (!currentCourier) return;
    
    const now = new Date();
    
    try {
      // Find the order details
      const orderToAccept = deliveryRequests.find(req => req.id === requestId);
      if (!orderToAccept) throw new Error("Order not found");
      
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
      
      // Send a notification to the customer about courier assignment
      try {
        // Store the notification in Supabase
        await supabase.from('notifications').insert({
          user_id: orderToAccept.customerId,
          title: 'Delivery update',
          message: `${currentCourier.name} has accepted your delivery and will pick up your order soon.`,
          type: 'delivery_update',
          order_id: requestId
        });
        
        // Mark this notification as sent to avoid duplicates
        setNotificationsSent(prev => ({...prev, [requestId]: true}));
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }
      
      toast.success('Delivery accepted');
      
    } catch (error) {
      console.error('Failed to accept delivery:', error);
      toast.error('Failed to accept delivery');
    }
  };

  const updateDeliveryStatus = async (requestId: string, status: DeliveryRequest['status'], timestamp: Date = new Date()) => {
    if (!currentCourier) return;
    
    try {
      const orderToUpdate = deliveryRequests.find(req => req.id === requestId);
      if (!orderToUpdate) throw new Error("Order not found");
      
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
      
      // Send notification based on status
      let notificationMessage = '';
      
      if (status === 'picked_up') {
        notificationMessage = `${currentCourier.name} has picked up your order and is on the way to deliver it.`;
      } else if (status === 'delivered') {
        notificationMessage = `${currentCourier.name} has delivered your order. Thank you for using our service!`;
        
        // Update courier's completed deliveries count
        if (currentCourier) {
          const updatedCourier = { 
            ...currentCourier, 
            completedDeliveries: (currentCourier.completedDeliveries || 0) + 1 
          };
          
          // Update in database
          await supabase
            .from('couriers')
            .update({ deliveries: updatedCourier.completedDeliveries })
            .eq('id', currentCourier.id);
        }
      } else if (status === 'cancelled') {
        notificationMessage = `Your delivery has been cancelled by ${currentCourier.name}. Please contact support for assistance.`;
      }
      
      // Send the notification if message exists and hasn't been sent yet
      if (notificationMessage && !notificationsSent[`${requestId}_${status}`]) {
        try {
          await supabase.from('notifications').insert({
            user_id: orderToUpdate.customerId,
            title: 'Delivery update',
            message: notificationMessage,
            type: 'delivery_update',
            order_id: requestId
          });
          
          // Mark this notification as sent
          setNotificationsSent(prev => ({...prev, [`${requestId}_${status}`]: true}));
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
        }
      }
      
      toast.success(`Order marked as ${status.replace('_', ' ')}`);
      
    } catch (error) {
      console.error('Failed to update delivery status:', error);
      toast.error('Failed to update status');
    }
  };

  const updateCourierAvailability = async (courierId: string, isAvailable: boolean) => {
    try {
      await supabase
        .from('couriers')
        .update({ status: isAvailable ? 'active' : 'inactive' })
        .eq('id', courierId);
    } catch (error) {
      console.error('Failed to update courier availability:', error);
    }
  };

  return {
    deliveryRequests,
    allCouriers,
    setAllCouriers,
    fetchAllCouriers,
    fetchRealTimeDeliveries,
    setupRealTimeSubscription,
    acceptDelivery,
    updateDeliveryStatus,
    updateCourierAvailability
  };
};
