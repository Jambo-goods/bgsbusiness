
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { notificationService, Notification } from "@/services/notifications";
import NotificationHeader from "./notification-dropdown/NotificationHeader";
import NotificationActions from "./notification-dropdown/NotificationActions";
import NotificationsList from "./notification-dropdown/NotificationsList";
import NotificationFooter from "./notification-dropdown/NotificationFooter";

interface NotificationDropdownProps {
  isOpen: boolean;
}

export default function NotificationDropdown({ isOpen }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    const data = await notificationService.getNotifications(5);
    setNotifications(data);
    setIsLoading(false);
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

  if (!isOpen) return null;
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 p-4 border border-gray-100 animate-fade-in">
      <NotificationHeader unreadCount={unreadCount} />
      
      <NotificationActions 
        unreadCount={unreadCount} 
        onMarkAllAsRead={handleMarkAllAsRead} 
      />
      
      <Separator className="my-2" />
      
      <NotificationsList 
        notifications={notifications} 
        isLoading={isLoading} 
        onMarkAsRead={handleMarkAsRead} 
      />
      
      <NotificationFooter />
    </div>
  );
}
