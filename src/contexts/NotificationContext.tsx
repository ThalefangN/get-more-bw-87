
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Define notification type
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  user_id: string;
  order_id?: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  showNotifications: false,
  setShowNotifications: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {},
  clearAllNotifications: () => {},
  addNotification: () => {},
});

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const { user, isAuthenticated } = useAuth();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Load notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();
      subscribeToNotifications();
    } else {
      setNotifications([]);
      if (subscription) {
        subscription.unsubscribe();
      }
    }
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isAuthenticated, user?.id]);
  
  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setNotifications(data as Notification[]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  const subscribeToNotifications = () => {
    if (!user?.id) return;
    
    const newSubscription = supabase
      .channel(`public:notifications:user_id=eq.${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Notification change received:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newNotification = payload.new as Notification;
          
          setNotifications(prev => [newNotification, ...prev]);
          
          toast.info(newNotification.title, {
            description: newNotification.message,
            action: {
              label: "View",
              onClick: () => setShowNotifications(true)
            },
          });
        } else if (payload.eventType === 'DELETE') {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev => 
            prev.map(n => n.id === payload.new.id ? (payload.new as Notification) : n)
          );
        }
      })
      .subscribe();
    
    setSubscription(newSubscription);
  };
  
  // Mark a notification as read
  const markAsRead = async (id: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user?.id || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Delete a notification
  const deleteNotification = async (id: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!user?.id || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };
  
  // Add a new notification
  const addNotification = async (notificationData: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    if (!user?.id) return;
    
    try {
      const newNotification = {
        ...notificationData,
        id: uuidv4(),
        user_id: user.id,
        read: false,
        created_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('notifications')
        .insert([newNotification]);
      
      if (error) throw error;
      
      // No need to update state here since the subscription will handle it
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showNotifications,
        setShowNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
