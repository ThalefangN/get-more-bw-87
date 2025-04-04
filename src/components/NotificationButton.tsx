
import { Bell } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NotificationButton = () => {
  const { unreadCount, setShowNotifications, showNotifications } = useNotifications();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleNotificationClick = () => {
    if (!isAuthenticated) {
      // If not authenticated, prompt to sign in
      toast("Please sign in", {
        description: "You need to be signed in to view your notifications",
        action: {
          label: "Sign in",
          onClick: () => navigate("/sign-in")
        },
      });
      return;
    }
    
    // If authenticated, toggle notifications panel
    setShowNotifications(!showNotifications);
  };
  
  return (
    <button 
      onClick={handleNotificationClick}
      className="relative text-gray-700 hover:text-getmore-purple ml-1"
    >
      <Bell size={24} />
      {unreadCount > 0 && isAuthenticated && (
        <span className="absolute -top-2 -right-2 bg-getmore-purple text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationButton;
