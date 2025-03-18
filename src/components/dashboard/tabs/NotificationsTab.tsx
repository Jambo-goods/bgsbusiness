
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationHeader from './notifications/NotificationHeader';
import NotificationsList from './notifications/NotificationsList';
import EmptyNotifications from './notifications/EmptyNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useUserSession } from '@/hooks/dashboard/useUserSession';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { NotificationType } from '@/services/notifications/types';

// Define the notification interface for this component
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  seen: boolean;
  created_at: string;
  user_id: string;
  data?: any;
}

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { userId } = useUserSession();
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchNotifications();

      // Set up real-time notifications
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
        console.error('Error fetching notifications:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer vos notifications"
        });
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error('Error in fetchNotifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, seen: true } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error in handleMarkAsRead:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!userId || notifications.length === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('user_id', userId)
        .eq('seen', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        toast({
          variant: "destructive", 
          title: "Erreur", 
          description: "Impossible de marquer les notifications comme lues"
        });
        return;
      }

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, seen: true }))
      );

      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues"
      });
    } catch (err) {
      console.error('Error in handleMarkAllRead:', err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (err) {
      console.error('Error in handleDeleteNotification:', err);
    }
  };

  const handleDeleteAll = async () => {
    if (!userId || notifications.length === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting all notifications:', error);
        toast({
          variant: "destructive", 
          title: "Erreur", 
          description: "Impossible de supprimer les notifications"
        });
        return;
      }

      setNotifications([]);
      
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été supprimées"
      });
    } catch (err) {
      console.error('Error in handleDeleteAll:', err);
    }
  };

  const hasUnreadNotifications = notifications.some(notification => !notification.seen);

  const filterNotifications = (type: string) => {
    if (type === 'all') return notifications;
    return notifications.filter(notification => notification.type === type);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-bgs-blue">Notifications</h1>

      <NotificationHeader 
        hasUnread={hasUnreadNotifications} 
        onMarkAllRead={handleMarkAllRead} 
        onDeleteAll={handleDeleteAll} 
      />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="account">Compte</TabsTrigger>
          <TabsTrigger value="deposit">Dépôts</TabsTrigger>
          <TabsTrigger value="withdrawal">Retraits</TabsTrigger>
          <TabsTrigger value="investment">Investissements</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        {Object.keys({ all: 'Toutes', account: 'Compte', deposit: 'Dépôts', withdrawal: 'Retraits', investment: 'Investissements', system: 'Système' }).map(tabValue => (
          <TabsContent key={tabValue} value={tabValue} className="mt-0">
            {filterNotifications(tabValue).length > 0 ? (
              <NotificationsList 
                notifications={filterNotifications(tabValue)} 
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDeleteNotification}
              />
            ) : (
              <EmptyNotifications notificationType={tabValue as NotificationType} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
