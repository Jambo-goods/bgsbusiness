
import { useState, useCallback, useEffect } from "react";
import { notificationService } from "@/services/notifications";
import type { Notification } from "@/services/notifications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useNotifications() {
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
      setNotifications(notificationsData);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Impossible de charger les notifications. Veuillez réessayer plus tard.");
      toast.error("Erreur", { description: "Impossible de charger les notifications" });
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  // Function to clear notifications from UI state immediately
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription
    const setupSubscription = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      
      const userId = userData.user.id;
      const channelId = `notifications-${userId}`;
      
      console.log(`Setting up real-time subscription for notifications (channel: ${channelId})`);
      
      const channel = supabase
        .channel(channelId)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
          (payload) => {
            console.log("Real-time notification update detected:", payload);
            
            if (payload.eventType === 'DELETE') {
              // For delete events, remove from local state
              if (payload.old && payload.old.id) {
                const deletedId = payload.old.id;
                console.log('Removing deleted notification from state:', deletedId);
                setNotifications(prev => 
                  prev.filter(notification => notification.id !== deletedId)
                );
              } else {
                // If can't identify the deleted notification, fetch all
                fetchNotifications();
              }
            } else {
              // For INSERT or UPDATE, fetch all notifications
              fetchNotifications();
            }
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status: ${status}`);
        });

      return () => {
        console.log(`Removing channel: ${channelId}`);
        supabase.removeChannel(channel);
      };
    };

    const subscription = setupSubscription();
    
    // Clean up subscription on unmount
    return () => {
      subscription.then(cleanup => cleanup && cleanup());
    };
  }, [fetchNotifications]);

  return {
    notifications,
    filter,
    setFilter,
    isRefreshing,
    isLoading,
    error,
    fetchNotifications,
    clearNotifications
  };
}
