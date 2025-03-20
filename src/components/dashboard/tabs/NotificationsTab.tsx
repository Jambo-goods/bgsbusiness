
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsList } from "./notifications/NotificationsList";
import { NotificationHeader } from "./notifications/NotificationHeader";
import { NotificationTabs } from "./notifications/NotificationTabs";
import { EmptyNotifications } from "./notifications/EmptyNotifications";
import { useAuth } from "@supabase/auth-helpers-react";
import { Loader2 } from "lucide-react";

export default function NotificationsTab() {
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const { user } = useAuth();

  // Fetch notifications from Supabase
  const { data: notifications, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Fetch notifications from Supabase
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
      
      // Transform the data to include proper category info from the data field
      return data.map(notification => {
        let category = "info";
        
        // Check if data exists and is an object with a category property
        if (notification.data) {
          try {
            // If data is a string, try to parse it
            const dataObj = typeof notification.data === 'string' 
              ? JSON.parse(notification.data) 
              : notification.data;
            
            // Check if dataObj is an object with a category property
            if (dataObj && typeof dataObj === 'object' && !Array.isArray(dataObj)) {
              category = dataObj.category || 
                         (notification.type === "deposit" ? "success" : 
                         notification.type === "withdrawal" ? "warning" : "info");
            }
          } catch (e) {
            console.error("Error parsing notification data:", e);
          }
        } else {
          // Default categories based on notification type
          category = notification.type === "deposit" ? "success" : 
                     notification.type === "withdrawal" ? "warning" : "info";
        }
        
        return {
          ...notification,
          category
        };
      });
    },
    enabled: !!user?.id,
  });

  // Mark notification as seen
  const markAsSeen = async (id: string) => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from("notifications")
        .update({ seen: true })
        .eq("id", id);
      
      refetch();
    } catch (error) {
      console.error("Error marking notification as seen:", error);
    }
  };

  // Mark all notifications as seen
  const markAllAsSeen = async () => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from("notifications")
        .update({ seen: true })
        .eq("user_id", user.id)
        .eq("seen", false);
      
      refetch();
    } catch (error) {
      console.error("Error marking all notifications as seen:", error);
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = React.useMemo(() => {
    if (!notifications) return [];
    
    if (activeTab === "all") {
      return notifications;
    } else if (activeTab === "unread") {
      return notifications.filter(notification => !notification.seen);
    } else {
      return notifications.filter(notification => notification.type === activeTab);
    }
  }, [notifications, activeTab]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
        <p>Une erreur est survenue lors du chargement des notifications.</p>
        <p className="text-sm mt-2">Veuillez rafraîchir la page ou réessayer plus tard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NotificationHeader notificationsCount={filteredNotifications.length} markAllAsSeen={markAllAsSeen} />
      
      <NotificationTabs activeTab={activeTab} setActiveTab={setActiveTab} notifications={notifications || []} />

      {filteredNotifications.length > 0 ? (
        <NotificationsList notifications={filteredNotifications} markAsSeen={markAsSeen} />
      ) : (
        <EmptyNotifications activeTab={activeTab} />
      )}
    </div>
  );
}
