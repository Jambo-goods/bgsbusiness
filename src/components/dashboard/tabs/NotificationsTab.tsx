
import React, { useState, useEffect } from 'react';
import { ReceiptText, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import NotificationHeader from './notifications/NotificationHeader';
import NotificationItem from './notifications/NotificationItem';
import EmptyNotifications from './notifications/EmptyNotifications';
import { useUserSession } from '@/hooks/dashboard/useUserSession';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { NotificationType } from '@/services/notifications/types';

// Define notification type compatible with the imported type
interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  seen: boolean;
  created_at: string;
  metadata?: any;
}

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useUserSession();
  const hasUnread = notifications.some(notification => !notification.seen);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      
      const channel = supabase
        .channel('notifications-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Impossible de charger vos notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAllRead = async () => {
    if (!userId || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('user_id', userId)
        .eq('seen', false);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, seen: true }))
      );
      
      toast.success('Toutes les notifications marquées comme lues');
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      toast.error('Impossible de marquer les notifications comme lues');
    }
  };

  const deleteAllNotifications = async () => {
    if (!userId || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications([]);
      
      toast.success('Toutes les notifications ont été supprimées');
    } catch (err) {
      console.error('Error deleting notifications:', err);
      toast.error('Impossible de supprimer les notifications');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      toast.success('Notification supprimée');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Impossible de supprimer la notification');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, seen: true } : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Impossible de marquer la notification comme lue');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.seen;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-bgs-blue">Mes notifications</h2>
          <p className="text-gray-600 mt-1">Consultez toutes vos notifications et messages importants</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={!hasUnread}
            onClick={markAllRead}
            className="flex items-center"
          >
            <Check className="h-4 w-4 mr-1" />
            Tout marquer comme lu
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            disabled={notifications.length === 0}
            onClick={deleteAllNotifications}
            className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Tout supprimer
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="unread">
            Non lues {hasUnread && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{notifications.filter(n => !n.seen).length}</span>}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onDelete={() => deleteNotification(notification.id)}
                  onMarkAsRead={() => markAsRead(notification.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyNotifications />
          )}
        </TabsContent>
        
        <TabsContent value="unread" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onDelete={() => deleteNotification(notification.id)}
                  onMarkAsRead={() => markAsRead(notification.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyNotifications />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
