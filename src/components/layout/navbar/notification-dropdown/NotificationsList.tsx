
import React from "react";
import { Notification } from "@/services/notifications";
import NotificationItem from "./NotificationItem";
import EmptyNotifications from "./EmptyNotifications";

interface NotificationsListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
}

export default function NotificationsList({ 
  notifications, 
  isLoading,
  onMarkAsRead 
}: NotificationsListProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        Chargement...
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return <EmptyNotifications />;
  }

  return (
    <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}
