
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Notification } from "@/services/notifications";
import { getNotificationTypeIcon } from "./utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export default function NotificationItem({ 
  notification, 
  onMarkAsRead 
}: NotificationItemProps) {
  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: fr
    });
  };

  return (
    <div 
      key={notification.id} 
      className={`py-3 hover:bg-gray-50 cursor-pointer rounded-md px-3 transition-colors ${notification.read ? '' : 'bg-blue-50'}`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
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
  );
}
