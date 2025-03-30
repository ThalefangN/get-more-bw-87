
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'delivery_update' | 'special_offer' | 'system';
  read: boolean;
  createdAt: Date;
  orderId?: string;
  userId: string;
  data?: any;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}
