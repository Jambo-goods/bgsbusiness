
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/services/notifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setIsLoading(false);
        return;
      }
      
      // Récupérer les 5 dernières notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error("Erreur lors de la récupération des notifications:", error);
        return;
      }

      // Format notifications for compatibility with the interface
      const formattedNotifications = data.map(notification => ({
        ...notification,
        // For compatibility with old code
        read: notification.seen,
        description: notification.message,
        date: notification.created_at
      })) as Notification[];
      
      setNotifications(formattedNotifications);
      
      // Compter les notifications non lues
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id)
        .eq('seen', false);
        
      if (!countError && count !== null) {
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('id', id);
        
      if (error) {
        console.error("Erreur lors du marquage comme lu:", error);
        return;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, seen: true, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleViewAll = () => {
    navigate("/dashboard?tab=notifications");
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel('notifications_dropdown')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, () => {
        fetchNotifications();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Format the date
  const formatNotificationDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr });
    } catch (e) {
      return "récemment";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-bgs-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-3 border-b border-gray-100">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-bgs-blue"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-auto divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.seen ? 'bg-blue-50' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <span className="text-xs text-gray-500">
                    {formatNotificationDate(notification.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="p-2 border-t border-gray-100 text-center">
          <button 
            onClick={handleViewAll}
            className="text-sm text-bgs-blue hover:text-bgs-blue-dark w-full py-1 hover:bg-gray-50 rounded"
          >
            Voir toutes les notifications
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
