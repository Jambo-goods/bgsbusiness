
import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { notificationService, Notification } from "@/services/notifications";
import { supabase } from "@/integrations/supabase/client";
import NotificationHeader from "./notifications/NotificationHeader";
import NotificationActions from "./notifications/NotificationActions";
import NotificationTabs from "./notifications/NotificationTabs";
import NotificationsList from "./notifications/NotificationsList";

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Real-time subscription removed
  }, []);

  const fetchNotifications = async () => {
    const data = await notificationService.getNotifications(50);
    setNotifications(data);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
  };

  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <NotificationHeader notificationCount={notifications.length} />
        <NotificationActions
          unreadCount={unreadCount}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
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
        
        <TabsContent value="unread" className="mt-4">
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
