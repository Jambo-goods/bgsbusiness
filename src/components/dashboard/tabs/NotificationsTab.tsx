
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EmptyNotifications from "./notifications/EmptyNotifications";
import NotificationsList from "./notifications/NotificationsList";
import NotificationHeader from "./notifications/NotificationHeader";
import { Bell, CheckCircle, AlertCircle } from "lucide-react";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  seen: boolean;
  read: boolean;
  user_id: string;
  data?: any;
};

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [hasUnread, setHasUnread] = useState(false);
  
  useEffect(() => {
    fetchNotifications();
    
    // Setup real-time subscription
    const notificationsChannel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, () => {
        fetchNotifications();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, []);
  
  // Update hasUnread state whenever notifications change
  useEffect(() => {
    const unreadExists = notifications.some(notification => !notification.read);
    setHasUnread(unreadExists);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Fetch notifications from database
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Impossible de charger les notifications');
        setNotifications([]);
      } else {
        // Convert the data to include the 'read' property
        const notificationsWithRead = data.map(notif => ({
          ...notif,
          read: notif.seen // Use 'seen' as 'read' for compatibility
        }));
        setNotifications(notificationsWithRead as Notification[]);
      }
    } catch (err) {
      console.error('Error in fetchNotifications:', err);
      toast.error('Une erreur est survenue');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id) return;
      
      const userId = sessionData.session.user.id;
      
      // Update all notifications to seen=true in database
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('user_id', userId)
        .eq('seen', false);
      
      if (error) {
        console.error('Error marking all as read:', error);
        toast.error('Impossible de marquer comme lu');
        return;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true, seen: true }))
      );
      
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (err) {
      console.error('Error in markAllAsRead:', err);
      toast.error('Une erreur est survenue');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id) return;
      
      const userId = sessionData.session.user.id;
      
      // Delete all notifications for user
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting notifications:', error);
        toast.error('Impossible de supprimer les notifications');
        return;
      }
      
      // Update local state
      setNotifications([]);
      
      toast.success('Toutes les notifications ont été supprimées');
    } catch (err) {
      console.error('Error in deleteAllNotifications:', err);
      toast.error('Une erreur est survenue');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('id', id);
      
      if (error) {
        console.error('Error marking as read:', error);
        return;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true, seen: true } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error in markAsRead:', err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting notification:', error);
        toast.error('Impossible de supprimer la notification');
        return;
      }
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      toast.success('Notification supprimée');
    } catch (err) {
      console.error('Error in handleDeleteNotification:', err);
      toast.error('Une erreur est survenue');
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'alerts') return notification.type.includes('alert');
    if (activeTab === 'info') return notification.type.includes('info');
    return true;
  });

  return (
    <div className="space-y-6">
      <NotificationHeader 
        hasUnread={hasUnread}
        onMarkAllRead={markAllAsRead}
        onDeleteAll={deleteAllNotifications}
      />
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto grid grid-cols-4 mb-4">
          <TabsTrigger value="all" className="px-4">
            Toutes
          </TabsTrigger>
          <TabsTrigger value="unread" className="px-4">
            Non lues
          </TabsTrigger>
          <TabsTrigger value="alerts" className="px-4">
            <AlertCircle className="h-4 w-4 mr-1" />
            Alertes
          </TabsTrigger>
          <TabsTrigger value="info" className="px-4">
            <CheckCircle className="h-4 w-4 mr-1" />
            Infos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgs-blue"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <NotificationsList 
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
              onDelete={handleDeleteNotification}
            />
          ) : (
            <EmptyNotifications type={activeTab} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsTab;
