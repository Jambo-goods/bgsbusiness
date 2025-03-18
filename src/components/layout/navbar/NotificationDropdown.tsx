
import React, { useState, useEffect } from 'react';
import { BellRing, Check, Trash2, Mail, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserSession } from '@/hooks/dashboard/useUserSession';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NotificationDropdownProps {
  unreadCount: number;
  onMarkAllRead: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  seen: boolean;
  created_at: string;
  type: string;
}

export function NotificationDropdown({ unreadCount, onMarkAllRead }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useUserSession();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (userId) {
      fetchNotifications();
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
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('user_id', userId)
        .eq('seen', false);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.map(notification => ({ ...notification, seen: true })));
      
      // Call the callback to update unread count in parent component
      onMarkAllRead();
      
      toast.success('Toutes les notifications marquées comme lues');
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      toast.error('Une erreur est survenue');
    }
  };
  
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, seen: true } : notification
        )
      );
      
      // Call the callback to update unread count in parent component
      onMarkAllRead();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const viewAllNotifications = () => {
    navigate('/dashboard', { state: { activeTab: 'notifications' } });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellRing className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs" 
              onClick={markAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-bgs-blue border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Chargement des notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <DropdownMenuGroup>
            {notifications.map(notification => (
              <DropdownMenuItem key={notification.id} className="p-0">
                <button 
                  className={`w-full text-left p-3 hover:bg-gray-50 ${!notification.seen ? 'bg-blue-50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      {notification.type === 'message' ? (
                        <Mail className="h-5 w-5 text-bgs-blue" />
                      ) : (
                        <Bell className="h-5 w-5 text-bgs-orange" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notification.seen && (
                      <div className="w-2 h-2 bg-bgs-blue rounded-full"></div>
                    )}
                  </div>
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ) : (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">Aucune notification</p>
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center" onClick={viewAllNotifications}>
          <Button variant="link" className="w-full h-9">Voir toutes les notifications</Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
