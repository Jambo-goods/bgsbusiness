
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
      
      // Get notifications directly from supabase
      const { data, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });
      
      if (notifError) throw notifError;
      
      if (!data) {
        console.log("No notifications data returned");
        setNotifications([]);
        return;
      }
      
      // Transform database notifications to UI notifications
      const transformedNotifications: Notification[] = data.map(dbNotif => {
        const dataObj = typeof dbNotif.data === 'object' ? dbNotif.data : {};
        return {
          id: dbNotif.id,
          title: dbNotif.title,
          description: dbNotif.message,
          date: new Date(dbNotif.created_at),
          read: dbNotif.seen,
          type: dbNotif.type,
          category: dataObj?.category || 'info',
          metadata: typeof dbNotif.data === 'object' ? dbNotif.data : {}
        };
      });
      
      console.log("Notifications fetched:", transformedNotifications.length);
      setNotifications(transformedNotifications);
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
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Veuillez vous connecter pour marquer les notifications comme lues");
        return;
      }
      
      // Update notifications in the database
      await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('user_id', session.session.user.id);
      
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
      // Update notification in the database
      await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('id', id);
      
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
      // Delete notification from the database
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
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

  const handleRefresh = async () => {
    await fetchNotifications();
    toast.info("Notifications actualisées");
  };

  const handleFilterChange = (newFilter: 'all' | 'unread') => {
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
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <NotificationTabs 
          totalCount={notifications.length}
          unreadCount={unreadCount}
          filter={filter}
          onFilterChange={handleFilterChange}
        />
        
        <TabsContent value="all" className="mt-4">
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
