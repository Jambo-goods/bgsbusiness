
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService } from "@/services/notifications";
import { supabase } from "@/integrations/supabase/client";
import type { Notification } from "@/services/notifications";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.slice(0, 5)); // Show only the 5 most recent
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
    
    // Set up real-time subscription
    if (user) {
      const channelId = `notification-dropdown-${user.id}`;
      const channel = supabase
        .channel(channelId)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, 
          (payload) => {
            console.log("NotificationDropdown: Realtime update detected:", payload);
            if (isOpen || payload.eventType === 'DELETE') {
              fetchNotifications();
            }
          }
        )
        .subscribe((status) => {
          console.log(`NotificationDropdown: Realtime subscription status: ${status}`);
        });
      
      return () => {
        console.log(`NotificationDropdown: Removing channel: ${channelId}`);
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, user]);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 border border-gray-100 py-2 animate-fade-in">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 mb-1">Notifications</div>
          
          {loading ? (
            <div className="px-4 py-6 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
              <span className="ml-2">Chargement...</span>
            </div>
          ) : notifications.length > 0 ? (
            <>
              {notifications.map(notif => (
                <div key={notif.id} className="px-4 py-2 border-b border-gray-50 hover:bg-gray-50">
                  <div className="text-sm font-medium">{notif.title}</div>
                  <div className="text-xs text-gray-500 truncate">{notif.description}</div>
                </div>
              ))}
              <div className="px-4 py-2 text-center">
                <a href="/dashboard/notifications" className="text-xs text-blue-500 hover:text-blue-700">
                  Voir toutes les notifications
                </a>
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center text-gray-500">
              Pas de nouvelles notifications
            </div>
          )}
        </div>
      )}
    </div>
  );
}
