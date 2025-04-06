
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { notificationService } from "@/services/notifications";
import type { Notification } from "@/services/notifications/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NotificationHeader from "./notifications/NotificationHeader";
import NotificationActions from "./notifications/NotificationActions";
import NotificationTabs from "./notifications/NotificationTabs";
import NotificationsList from "./notifications/NotificationsList";

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      console.log("Fetching notifications...");
      // Get user session
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.log("No session found");
        setError("Veuillez vous connecter pour voir vos notifications");
        return;
      }
      
      // Get notifications using the service
      const notificationsData = await notificationService.getNotifications();
      console.log("Notifications fetched:", notificationsData.length);
      
      // Make sure to convert the types correctly
      setNotifications(notificationsData as unknown as Notification[]);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Impossible de charger les notifications. Veuillez réessayer plus tard.");
      toast.error("Erreur", { description: "Impossible de charger les notifications" });
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' }, 
        () => {
          console.log("Real-time notification update detected");
          fetchNotifications();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch (err) {
      console.error("Error marking all as read:", err);
      toast.error("Erreur", { description: "Impossible de marquer toutes les notifications comme lues" });
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      toast.error("Erreur", { description: "Impossible de marquer la notification comme lue" });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      );
      
      toast.success("Notification supprimée");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Erreur", { description: "Impossible de supprimer la notification" });
    }
  };

  const handleDeleteAll = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Erreur", { description: "Vous devez être connecté pour effectuer cette action" });
        return;
      }
      
      await notificationService.deleteAllNotifications();
      
      // Update local state
      setNotifications([]);
      
      toast.success("Toutes les notifications ont été supprimées");
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error("Erreur", { description: "Impossible de supprimer toutes les notifications" });
    }
  };

  const handleRefresh = async () => {
    await fetchNotifications();
    toast.info("Notifications actualisées");
  };

  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    console.log("Filter changed to:", newFilter);
    setFilter(newFilter);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bgs-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchNotifications}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <NotificationHeader notificationCount={notifications.length} />
        <NotificationActions
          unreadCount={unreadCount}
          isRefreshing={isRefreshing}
          onRefresh={fetchNotifications}
          onMarkAllAsRead={handleMarkAllAsRead}
          totalCount={notifications.length}
          onDeleteAll={handleDeleteAll}
        />
      </div>

      <Tabs value={filter} className="w-full">
        <NotificationTabs 
          totalCount={notifications.length}
          unreadCount={unreadCount}
          filter={filter}
          onFilterChange={handleFilterChange}
        />
        
        <TabsContent value={filter} className="mt-4">
          <NotificationsList 
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDeleteNotification}
            filter={filter}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
