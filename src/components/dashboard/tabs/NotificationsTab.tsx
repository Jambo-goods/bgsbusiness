
import { useState, useEffect } from "react";
import { Bell, Settings, Trash2, CheckCircle, AlertTriangle, RefreshCw, Wallet, Briefcase, Shield, Megaphone, Info, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notificationService, Notification, NotificationType } from "@/services/NotificationService";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('notifications_tab_changes')
      .on('postgres_changes', {
        event: '*',
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

  const getNotificationTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'deposit':
      case 'withdrawal':
        return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'investment':
        return <Briefcase className="h-5 w-5 text-green-500" />;
      case 'security':
        return <Shield className="h-5 w-5 text-purple-500" />;
      case 'marketing':
        return <Megaphone className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationCategoryIcon = (category?: string) => {
    switch (category) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatNotificationDate = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: fr
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-bgs-blue">Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos alertes et notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const { data: session } = await supabase.auth.getSession();
                if (!session.session) return;
                
                // Find all notification IDs for this user
                const { data } = await supabase
                  .from('notifications')
                  .select('id')
                  .eq('user_id', session.session.user.id);
                
                if (!data || data.length === 0) return;
                
                // Delete by IDs as we can't use direct user_id filtering with delete
                const ids = data.map(n => n.id);
                const { error } = await supabase
                  .from('notifications')
                  .delete()
                  .in('id', ids);
                
                if (error) throw error;
                
                setNotifications([]);
              } catch (error) {
                console.error("Error deleting all notifications:", error);
              }
            }}
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Tout supprimer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
          <TabsTrigger 
            value="all" 
            onClick={() => setFilter('all')}
          >
            Toutes ({notifications.length})
          </TabsTrigger>
          <TabsTrigger 
            value="unread" 
            onClick={() => setFilter('unread')}
            disabled={unreadCount === 0}
          >
            Non lues ({unreadCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>
        
        <TabsContent value="unread" className="mt-4">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderNotificationsList(notifications: Notification[]) {
    if (notifications.length === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Bell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Aucune notification</h3>
          <p className="text-gray-500 mt-1">
            Vous n'avez actuellement aucune notification {filter === 'unread' ? 'non lue' : ''}.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className={`p-4 rounded-lg border ${notification.read ? 'bg-white' : 'bg-blue-50 border-blue-100'} transition-colors`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getNotificationTypeIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className={`font-medium ${notification.read ? 'text-gray-900' : 'text-blue-800'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {formatNotificationDate(notification.date)}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-blue-700'}`}>
                  {notification.description}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!notification.read && (
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Marquer comme lu"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </Button>
                )}
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteNotification(notification.id)}
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
