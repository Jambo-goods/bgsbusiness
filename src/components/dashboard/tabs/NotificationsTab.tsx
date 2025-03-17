
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Bell,
  CheckCircle,
  Info,
  XCircle,
  AlertTriangle,
  Loader2,
  Eye,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  created_at: string;
  seen: boolean; // Changed from read to seen to match the database
}

const NotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get userId from session instead of currentUser
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user ID from session
    const getUserId = async () => {
      const { data } = await supabase.auth.getSession();
      const id = data.session?.user?.id || null;
      setUserId(id);
      if (id) {
        fetchNotifications(id);
      }
    };
    
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      // Set up real-time listener for new notifications
      const channel = supabase
        .channel(`user_notifications:${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
          (payload) => {
            console.log('New notification received:', payload);
            fetchNotifications(userId);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const fetchNotifications = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        setError(error.message);
        toast.error('Failed to load notifications.');
      } else {
        // Map to our Notification interface
        setNotifications(data?.map(item => ({
          id: item.id,
          user_id: item.user_id,
          type: item.type as 'info' | 'success' | 'warning' | 'error',
          message: item.message,
          created_at: item.created_at,
          seen: item.seen || false // Use seen instead of read
        })) || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('An error occurred while retrieving data');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    supabase
      .from('notifications')
      .update({ seen: true }) // Change read to seen
      .eq('id', id)
      .then(() => {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === id ? { ...notification, seen: true } : notification
          )
        );
      })
      .catch((error) => {
        console.error('Error marking as read:', error);
        toast.error('Failed to mark as read.');
      });
  };

  const clearAllNotifications = (userId: string) => {
    supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .then(() => {
        setNotifications([]);
        toast.success('All notifications cleared.');
      })
      .catch((error) => {
        console.error('Error clearing notifications:', error);
        toast.error('Failed to clear all notifications.');
      });
  };

  const deleteNotification = (id: string) => {
    supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .then(() => {
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification.id !== id)
        );
        toast.success('Notification deleted.');
      })
      .catch((error) => {
        console.error('Error deleting notification:', error);
        toast.error('Failed to delete notification.');
      });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
          <Badge className="ml-2">{notifications.length}</Badge>
        </CardTitle>
        <CardDescription>
          Here are all your latest notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] w-full">
          <div className="p-4 space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-500">No notifications yet.</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-md p-3 flex items-start space-x-3 ${notification.seen ? 'bg-gray-50' : 'bg-white'
                    }`}
                >
                  <div className="flex-shrink-0">{getIcon(notification.type)}</div>
                  <div>
                    <div className="font-medium">{notification.message}</div>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    {!notification.seen && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Mark as Read</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="justify-between">
        <Button 
          variant="outline"
          onClick={() => {
            if (userId) {
              setNotifications(prevNotifications => 
                prevNotifications.map(n => ({ ...n, seen: true }))
              );
              
              // Update all notifications to seen in the database
              supabase
                .from('notifications')
                .update({ seen: true })
                .eq('user_id', userId)
                .then(() => {
                  toast.success("All notifications marked as read");
                })
                .catch(error => {
                  console.error("Error marking all as read:", error);
                  toast.error("Failed to mark all as read");
                });
            }
          }}
        >
          <Check className="mr-2 h-4 w-4" /> Mark all as read
        </Button>
        <Button 
          onClick={() => userId && clearAllNotifications(userId)}
        >
          Clear all <X className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationsTab;
