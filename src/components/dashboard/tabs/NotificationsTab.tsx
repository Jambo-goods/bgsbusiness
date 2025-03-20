
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import NotificationsList from "./notifications/NotificationsList";
import NotificationHeader from "./notifications/NotificationHeader";
import NotificationTabs from "./notifications/NotificationTabs";
import EmptyNotifications from "./notifications/EmptyNotifications";
import { useUser } from "@/hooks/dashboard/useUserSession";
import { supabase } from "@/integrations/supabase/client";

export default function NotificationsTab() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Convert JSON data field to object if it's a string
      const processedData = data.map(notification => {
        try {
          // Check if data is a string and try to parse it
          if (notification.data && typeof notification.data === 'string') {
            notification.data = JSON.parse(notification.data);
          }
        } catch (e) {
          console.error("Error parsing notification data:", e);
        }
        return notification;
      });
      
      setNotifications(processedData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Impossible de charger vos notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` }, 
        () => {
          fetchNotifications();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ seen: true })
        .eq("user_id", user?.id);
        
      if (error) throw error;
      
      fetchNotifications();
      toast.success("Toutes les notifications marquées comme lues");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Impossible de mettre à jour les notifications");
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ seen: true })
        .eq("id", notificationId);
        
      if (error) throw error;
      
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Impossible de mettre à jour la notification");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);
        
      if (error) throw error;
      
      fetchNotifications();
      toast.success("Notification supprimée");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Impossible de supprimer la notification");
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.seen;
    return notification.type === activeTab;
  });

  return (
    <div className="space-y-6">
      <NotificationHeader 
        notificationCount={notifications.length} 
        markAllAsRead={markAllAsRead} 
      />
      
      <Card>
        <NotificationTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <NotificationsList
              notifications={filteredNotifications}
              markAsRead={markAsRead}
              deleteNotification={deleteNotification}
            />
          ) : (
            <EmptyNotifications activeTab={activeTab} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
