
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Bell, 
  Check, 
  Wallet, 
  Briefcase, 
  Shield, 
  Megaphone, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";
import type { Notification } from "@/services/notifications/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Define utility functions directly here instead of importing them from a path that doesn't exist
const getNotificationTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'deposit':
      return <Wallet className="h-5 w-5 text-blue-500" />;
    case 'withdrawal':
      return <Wallet className="h-5 w-5 text-orange-500" />;
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
  switch (category?.toLowerCase()) {
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

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
    
    // Add real-time notification listener to improve notification visibility
    const notificationChannel = supabase
      .channel('real-time-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        console.log("New notification detected, refreshing list:", payload);
        fetchNotifications();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        console.log("Notification updated, refreshing list:", payload);
        fetchNotifications();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching latest notifications");
      const data = await notificationService.getNotifications();
      console.log("Latest notifications fetched:", data);
      setNotifications(data.slice(0, 5)); // Only take the first 5
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleViewAllClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClose) onClose();
    navigate("/dashboard?tab=notifications");
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: fr
    });
  };

  if (!isOpen) return null;
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 p-4 border border-gray-100 animate-fade-in">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-bgs-blue">Notifications</h3>
        {unreadCount > 0 && (
          <span className="text-xs bg-bgs-orange/10 text-bgs-orange px-2 py-0.5 rounded-full font-medium">
            {unreadCount} {unreadCount === 1 ? 'nouvelle' : 'nouvelles'}
          </span>
        )}
      </div>
      
      {unreadCount > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mb-2 text-xs"
          onClick={handleMarkAllAsRead}
        >
          <Check className="h-3 w-3 mr-1" /> Tout marquer comme lu
        </Button>
      )}
      
      <Separator className="my-2" />
      
      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Aucune notification
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`py-3 hover:bg-gray-50 cursor-pointer rounded-md px-3 transition-colors ${notification.read ? '' : 'bg-blue-50'}`}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {getNotificationTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-blue-800'}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {formatDate(notification.date)}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${notification.read ? 'text-gray-500' : 'text-blue-700'}`}>
                    {notification.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <button 
        onClick={handleViewAllClick}
        className="block w-full text-center text-sm text-bgs-blue hover:text-bgs-blue-dark mt-3 font-medium transition-colors"
      >
        Voir toutes les notifications
      </button>
    </div>
  );
}
