
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationHeader from "./notifications/NotificationHeader";
import NotificationsList from "./notifications/NotificationsList";
import EmptyNotifications from "./notifications/EmptyNotifications";
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/services/notifications";
import { toast } from "sonner";

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Veuillez vous connecter pour voir vos notifications");
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Erreur lors de la récupération des notifications:", error);
        toast.error("Impossible de charger les notifications");
      } else {
        // Format notifications to match the interface
        const formattedNotifications = data.map(notification => ({
          ...notification,
          // For compatibility with old code
          read: notification.seen,
          description: notification.message,
          date: notification.created_at
        })) as Notification[];
        
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('user_id', session.session.user.id)
        .eq('seen', false);
        
      if (error) {
        console.error("Erreur:", error);
        return;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, seen: true, read: true }))
      );
      
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('id', id);
        
      if (error) {
        console.error("Erreur:", error);
        return;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, seen: true, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('notifications_changes')
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

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.seen;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.seen).length;

  return (
    <div className="space-y-6">
      <NotificationHeader 
        totalCount={notifications.length} 
        unreadCount={unreadCount}
        onMarkAllAsRead={markAllAsRead}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="unread">Non lues ({unreadCount})</TabsTrigger>
          <TabsTrigger value="deposit">Dépôts</TabsTrigger>
          <TabsTrigger value="investment">Investissements</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgs-blue"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <NotificationsList 
              notifications={filteredNotifications} 
              onMarkAsRead={markAsRead}
            />
          ) : (
            <EmptyNotifications />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
