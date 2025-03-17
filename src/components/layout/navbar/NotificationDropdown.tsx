
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check, Trash, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export type Json = any;

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  seen: boolean;
  read: boolean;
  user_id: string;
  data?: Json;
};

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id) {
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
        
      if (error) {
        console.error("Error fetching notifications:", error);
      } else {
        // Convert seen property to read for compatibility
        const notificationsWithRead = data.map(notif => ({
          ...notif,
          read: notif.seen
        })) as Notification[];
        setNotifications(notificationsWithRead);
      }
    } catch (err) {
      console.error("Error in fetchNotifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ seen: true })
        .eq("id", id);
        
      if (error) {
        console.error("Error marking notification as read:", error);
      } else {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, seen: true, read: true } 
              : notification
          )
        );
      }
    } catch (err) {
      console.error("Error in markAsRead:", err);
    }
  };

  const handleViewAll = () => {
    navigate("/dashboard?tab=notifications");
    onClose();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM, HH:mm", { locale: fr });
  };

  const getNotificationIcon = (type: string) => {
    const bgColorClass = type.includes("alert") ? "bg-red-100" : "bg-blue-100";
    const textColorClass = type.includes("alert") ? "text-red-500" : "text-bgs-blue";
    
    return (
      <div className={`${bgColorClass} p-2 rounded-full`}>
        <Bell className={`w-4 h-4 ${textColorClass}`} />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-medium text-gray-800">Notifications</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <ScrollArea className="max-h-[70vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-bgs-blue"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>Pas de notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 hover:bg-gray-50 transition-colors ${!notification.read ? "bg-blue-50/30" : ""}`}
              >
                <div className="flex gap-3">
                  {getNotificationIcon(notification.type)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatDate(notification.created_at)}
                      </span>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Marquer comme lu"
                          >
                            <Check className="w-3 h-3 text-bgs-blue" />
                          </button>
                        )}
                        <button 
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Supprimer"
                        >
                          <Trash className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-3 border-t border-gray-100">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-bgs-blue"
          onClick={handleViewAll}
        >
          Voir toutes les notifications
        </Button>
      </div>
    </div>
  );
}
