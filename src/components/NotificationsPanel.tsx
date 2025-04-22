
import { useNotifications } from '@/contexts/NotificationContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, ShoppingBag, Truck, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotificationsPanel() {
  const { 
    notifications, 
    showNotifications, 
    setShowNotifications, 
    markAsRead, 
    deleteNotification, 
    clearAllNotifications,
    markAllAsRead
  } = useNotifications();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_update':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'delivery_update':
        return <Truck className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-purple-500" />;
    }
  };
  
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };
  
  return (
    <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
      <DialogContent className="sm:max-w-[420px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-getmore-purple" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-getmore-purple text-white">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs h-8"
                    onClick={markAllAsRead}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-8"
                  onClick={clearAllNotifications}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 max-h-[50vh]">
          {notifications.length > 0 ? (
            <div className="space-y-4 py-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg relative ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50'
                  } hover:bg-gray-100 transition-colors`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-getmore-purple'}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {getTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      
                      {notification.data?.items && (
                        <div className="mt-2">
                          <p className="font-bold text-gray-700 mb-1">Order Details</p>
                          <ul className="pl-4 list-disc text-sm text-gray-600">
                            {notification.data.items.map((item: any, idx: number) => (
                              <li key={idx}>
                                {item.name} × {item.quantity} - P{item.price}
                              </li>
                            ))}
                          </ul>
                          <p className="font-semibold text-emerald-700 mt-2">
                            Total: P{notification.data.total}
                          </p>
                        </div>
                      )}
                      
                      {notification.order_id && (
                        <div className="mt-2">
                          <Link 
                            to={`/orders/${notification.order_id}`}
                            className="text-xs bg-getmore-purple text-white px-2 py-1 rounded inline-flex items-center"
                            onClick={() => {
                              markAsRead(notification.id);
                              setShowNotifications(false);
                            }}
                          >
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            View Order
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        aria-label="Mark as read"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Bell className="h-12 w-12 mb-2 text-gray-300" />
              <p>No notifications yet</p>
              <p className="text-sm">We'll notify you when something happens</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
